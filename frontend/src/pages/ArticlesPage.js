import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, message, Typography, Spin, Row, Col, Tabs, Avatar, List } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, BarChartOutlined, FileTextOutlined, UserOutlined, RightOutlined } from '@ant-design/icons';
import { articleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactECharts from 'echarts-for-react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [authorStats, setAuthorStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // 加载文章数据
  const fetchArticles = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await articleAPI.getArticles(params);
      setArticles(response.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.headers['x-total-count'] || response.data.length
      });
    } catch (error) {
      console.error('获取文章列表失败:', error);
      message.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载作者统计数据
  const fetchAuthorStats = async () => {
    setStatsLoading(true);
    try {
      const response = await articleAPI.getAuthorStats();
      setAuthorStats(response.data);
    } catch (error) {
      console.error('获取作者统计数据失败:', error);
      message.error('获取统计数据失败');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(pagination.current, pagination.pageSize, searchText);
    fetchAuthorStats();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => moment(a.created_at).valueOf() - moment(b.created_at).valueOf(),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        // 只有文章作者可以编辑和删除
        const isAuthor = record.author_id === user?.id;
        return (
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
              disabled={!isAuthor}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这篇文章吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
              disabled={!isAuthor}
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
                disabled={!isAuthor}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // 处理表格分页变化
  const handleTableChange = (pagination) => {
    fetchArticles(pagination.current, pagination.pageSize, searchText);
  };

  // 搜索文章
  const handleSearch = () => {
    fetchArticles(1, pagination.pageSize, searchText);
  };

  // 添加新文章
  const handleAdd = () => {
    setEditingArticle(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑文章
  const handleEdit = (article) => {
    setEditingArticle(article);
    form.setFieldsValue({
      title: article.title,
      content: article.content || ''
    });
    setModalVisible(true);
  };

  // 删除文章
  const handleDelete = async (id) => {
    try {
      await articleAPI.deleteArticle(id);
      message.success('文章已删除');
      fetchArticles(pagination.current, pagination.pageSize, searchText);
      fetchAuthorStats(); // 更新统计数据
    } catch (error) {
      console.error('删除文章失败:', error);
      message.error('删除文章失败');
    }
  };

  // 保存文章（新增或更新）
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingArticle) {
        // 更新现有文章
        await articleAPI.updateArticle(editingArticle.id, values);
        message.success('文章已更新');
      } else {
        // 创建新文章
        await articleAPI.createArticle(values);
        message.success('文章已创建');
      }
      
      setModalVisible(false);
      fetchArticles(pagination.current, pagination.pageSize, searchText);
      fetchAuthorStats(); // 更新统计数据
    } catch (error) {
      console.error('保存文章失败:', error);
      message.error('保存文章失败');
    } finally {
      setLoading(false);
    }
  };

  // 准备统计图表数据
  const getStatisticsOption = () => {
    const authors = authorStats.map(stat => stat.username);
    const articleCounts = authorStats.map(stat => stat.article_count);
    
    return {
      title: {
        text: '作者文章数量统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: authors,
        axisLabel: {
          interval: 0,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        name: '文章数量'
      },
      series: [
        {
          data: articleCounts,
          type: 'bar',
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          },
          itemStyle: {
            color: '#1890ff'
          },
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    };
  };
  
  // 进入作者文章详情页
  const goToAuthorArticles = (authorId, authorName) => {
    // 导航到作者文章详情页，需要传递作者ID和名称
    navigate(`/articles/author/${authorId}`, { state: { authorName } });
  };

  return (
    <div>
      <Card bordered={false}>
        <Title level={2}>文章管理</Title>
        
        <Tabs defaultActiveKey="list">
          <TabPane 
            tab={<span><FileTextOutlined />文章列表</span>}
            key="list"
          >
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Input.Search
                  placeholder="按标题搜索文章"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                />
              </Col>
              <Col span={16} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  添加文章
                </Button>
              </Col>
            </Row>
            
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={articles}
                rowKey="id"
                pagination={pagination}
                onChange={handleTableChange}
                expandable={{
                  expandedRowRender: (record) => (
                    <p style={{ margin: 0 }}>{record.content || '无内容'}</p>
                  ),
                }}
              />
            </Spin>
          </TabPane>

          <TabPane 
            tab={<span><BarChartOutlined />作者统计</span>}
            key="stats"
          >
            <Spin spinning={statsLoading}>
              <Row gutter={24}>
                {/* 左侧：作者列表 */}
                <Col span={10}>
                  <Card title="作者列表" bordered={false}>
                    <List
                      itemLayout="horizontal"
                      dataSource={authorStats}
                      renderItem={author => (
                        <List.Item 
                          actions={[
                            <Button 
                              type="primary" 
                              size="small" 
                              icon={<RightOutlined />}
                              onClick={() => goToAuthorArticles(author.author_id, author.username)}
                            >
                              进入文章管理
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} src={author.avatar_url} />}
                            title={author.username}
                            description={
                              <Text>文章数: <Text strong>{author.article_count}</Text></Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                {/* 右侧：统计图表 */}
                <Col span={14}>
                  <Card title="文章数量统计" bordered={false}>
                    {authorStats.length > 0 ? (
                      <ReactECharts 
                        option={getStatisticsOption()} 
                        style={{ height: 400, marginTop: 24 }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: 100 }}>
                        暂无作者统计数据
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
            </Spin>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 添加/编辑文章模态框 */}
      <Modal
        title={editingArticle ? '编辑文章' : '添加文章'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入文章标题' }]}
          >
            <Input placeholder="请输入文章标题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
          >
            <TextArea 
              placeholder="请输入文章内容"
              autoSize={{ minRows: 6, maxRows: 15 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ArticlesPage;