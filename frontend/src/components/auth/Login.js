import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, userAPI } from '../../services/api';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. 登录获取令牌
      const response = await authAPI.login(values.username, values.password);
      const token = response.data.access_token;
      
      // 2. 先将令牌保存到本地存储
      localStorage.setItem('token', token);
      
      // 3. 使用令牌获取用户信息
      const userResponse = await userAPI.getCurrentUser();
      
      // 4. 存储令牌和用户信息到上下文
      login(token, userResponse.data);
      
      message.success('登录成功！');
      // 5. 跳转到首页
      navigate('/dashboard');
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败: ' + (error.response?.data?.detail || '请检查用户名和密码'));
      // 登录失败时，清除可能部分保存的令牌
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', marginTop: 64 }}>
      <Card bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>用户登录</Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          
          {/* 添加忘记密码链接 */}
          <Form.Item>
            <Row justify="end">
              <Col>
                <Link to="/reset-password">忘记密码？</Link>
              </Col>
            </Row>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <span>没有账号？</span>
            <Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;