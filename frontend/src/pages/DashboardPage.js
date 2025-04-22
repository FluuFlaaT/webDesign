import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Empty, Row, Col, Descriptions, Avatar, Divider, Statistic } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, WalletOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { articleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const { Title } = Typography;

const DashboardPage = () => {
  const [authorStats, setAuthorStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAuthorStats();
  }, []);

  const fetchAuthorStats = async () => {
    setLoading(true);
    try {
      const response = await articleAPI.getAuthorStats();
      setAuthorStats(response.data);
    } catch (error) {
      console.error('获取作者统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 准备图表数据
  const getOption = () => {
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

  // 查找当前用户的文章统计
  const currentUserStats = authorStats.find(stat => stat.author_id === user?.id) || { article_count: 0 };

  return (
    <div>
      {/* 用户基本信息卡片 */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} sm={24} md={6} lg={5} xl={4} xxl={3} style={{ textAlign: 'center' }}>
            {user?.avatar_url ? (
              <Avatar 
                src={user.avatar_url} 
                size={120}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              />
            ) : (
              <Avatar 
                icon={<UserOutlined />} 
                size={120}
                style={{ backgroundColor: '#1890ff' }}
              />
            )}
          </Col>
          <Col xs={24} sm={24} md={18} lg={19} xl={20} xxl={21}>
            <Title level={2}>{user?.username} 的个人信息</Title>
            <Descriptions column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}>
              <Descriptions.Item label={<><UserOutlined /> 用户名</>}>{user?.username}</Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> 电子邮箱</>}>{user?.email}</Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined /> 生日</>}>
                {user?.birthday ? moment(user.birthday).format('YYYY-MM-DD') : '未设置'}
              </Descriptions.Item>
              <Descriptions.Item label={<><WalletOutlined /> 账户余额</>}>¥{user?.balance?.toFixed(2) || '0.00'}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* 用户统计信息 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic 
              title="我的文章数" 
              value={currentUserStats.article_count} 
              suffix="篇" 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic 
              title="总作者数" 
              value={authorStats.length} 
              suffix="人" 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={8}>
          <Card>
            <Statistic 
              title="平台总文章" 
              value={authorStats.reduce((acc, curr) => acc + curr.article_count, 0)} 
              suffix="篇" 
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表统计 */}
      <Card bordered={false}>
        <Title level={3}>作者文章统计</Title>
        <Divider />
        <Spin spinning={loading}>
          {authorStats.length > 0 ? (
            <ReactECharts 
              option={getOption()} 
              style={{ height: 400 }}
            />
          ) : (
            <Empty description="暂无作者统计数据" />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default DashboardPage;