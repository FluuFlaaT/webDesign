import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, message, Typography, Spin, Row, Col, Avatar, Descriptions, Divider, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UserOutlined, LeftOutlined } from '@ant-design/icons';
import { articleAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AuthorArticlesPage = () => {
  const { authorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const authorName = location.state?.authorName || '作者';
  
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorLoading, setAuthorLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 加载作者信息
  const fetchAuthorInfo = async () => {
    setAuthorLoading(true);
    try {
      const response = await userAPI.getAuthorDetail(authorId);
      setAuthor(response.data);
    } catch (error) {
      console.error('获取作者信息失败:', error);
      message.error('获取作者信息失败');
    } finally {
      setAuthorLoading(false);
    }
  };

  // 加载作者文章
  const fetchAuthorArticles = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await articleAPI.getArticlesByAuthor(authorId, params);
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

  useEffect(() => {
    fetchAuthorInfo();
    fetchAuthorArticles(pagination.current, pagination.pageSize, searchText);
  }, [authorId]);

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
        const isAuthor = record.author_id === currentUser?.id;
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
    fetchAuthorArticles(pagination.current, pagination.pageSize, searchText);
  };

  // 搜索文章
  const handleSearch = () => {
    fetchAuthorArticles(1, pagination.pageSize, searchText);
  };

  // 添加新文章
  const handleAdd = () => {
    // 只有当前用户是作者本人时才能添加文章
    if (currentUser.id !== parseInt(authorId)) {
      message.warning('您只能为自己添加文章');
      return;
    }

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
      fetchAuthorArticles(pagination.current, pagination.pageSize, searchText);
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
      fetchAuthorArticles(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error('保存文章失败:', error);
      message.error('保存文章失败');
    } finally {
      setLoading(false);
    }
  };

  // 返回文章管理页面
  const goBackToArticlesPage = () => {
    navigate('/articles');
  };

  // 格式化生日显示
  const formatBirthday = (birthdayString) => {
    if (!birthdayString) return '未设置';
    return moment(birthdayString).format('YYYY-MM-DD');
  };

  // 是否为当前用户自己的页面
  const isCurrentUser = currentUser?.id === parseInt(authorId);

  return (
    <div>
      <Button 
        icon={<LeftOutlined />} 
        style={{ marginBottom: 16 }} 
        onClick={goBackToArticlesPage}
      >
        返回文章管理
      </Button>

      <Spin spinning={authorLoading}>
        {author && (
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Row gutter={24} align="middle">
              <Col span={4} style={{ textAlign: 'center' }}>
                <Avatar 
                  size={100} 
                  src={author.avatar_url} 
                  icon={<UserOutlined />} 
                />
              </Col>
              <Col span={16}>
                <Descriptions title="作者信息" bordered>
                  <Descriptions.Item label="用户名" span={3}>{author.username}</Descriptions.Item>
                  <Descriptions.Item label="邮箱" span={3}>{author.email}</Descriptions.Item>
                  <Descriptions.Item label="生日" span={3}>{formatBirthday(author.birthday)}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={4}>
                <Statistic title="余额" value={author.balance || 0} prefix="￥" />
              </Col>
            </Row>
          </Card>
        )}
      </Spin>

      <Divider orientation="left">{authorName}的文章列表</Divider>
      
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
            disabled={!isCurrentUser}
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

export default AuthorArticlesPage;