import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import { articleAPI } from '../services/api';

const { Title } = Typography;

const DashboardPage = () => {
  const [authorStats, setAuthorStats] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <Card bordered={false}>
        <Title level={2}>数据统计</Title>
        
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