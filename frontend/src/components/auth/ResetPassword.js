import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import moment from 'moment';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [form] = Form.useForm();

  // 第一步：请求重置密码
  const requestReset = async (values) => {
    setLoading(true);
    try {
      // 保存用户名和邮箱以便后续使用
      setUsername(values.username);
      setEmail(values.email);
      
      // 进入下一步 - 使用生日验证身份
      setCurrentStep(1);
      message.success('请输入您的生日进行身份验证');
    } catch (error) {
      console.error('请求重置密码失败:', error);
      message.error('身份验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 第二步：使用生日验证身份
  const verifyIdentity = async (values) => {
    setLoading(true);
    try {
      // 将生日转换为YYYY-MM-DD格式
      const formattedBirthday = values.birthday.format('YYYY-MM-DD');
      
      // 在实际应用中这里应该调用后端API来验证用户名和生日是否匹配
      // 由于是模拟实现，假设验证成功
      message.success('身份验证成功，请设置新密码');
      setCurrentStep(2);
    } catch (error) {
      console.error('身份验证失败:', error);
      message.error('生日信息不匹配，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 第三步：设置新密码
  const resetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    setLoading(true);
    try {
      // 这里应该调用后端API来重置密码
      // 由于这是一个模拟实现，我们只是假装重置了密码
      message.success('密码已成功重置，请使用新密码登录');
      setCurrentStep(3);
    } catch (error) {
      console.error('重置密码失败:', error);
      message.error('重置密码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 根据当前步骤渲染不同的表单
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            name="resetRequest"
            onFinish={requestReset}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入您的用户名" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="电子邮箱"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="请输入您注册时使用的邮箱" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                下一步
              </Button>
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form
            form={form}
            name="verifyIdentity"
            onFinish={verifyIdentity}
            layout="vertical"
          >
            <Paragraph>
              您好 {username}，请输入您注册时填写的生日进行身份验证。
            </Paragraph>
            <Form.Item
              name="birthday"
              label="生日"
              rules={[{ required: true, message: '请选择您的生日!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="选择生日"
                format="YYYY-MM-DD"
                prefix={<CalendarOutlined />} 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                验证
              </Button>
            </Form.Item>
          </Form>
        );
      case 2:
        return (
          <Form
            form={form}
            name="newPassword"
            onFinish={resetPassword}
            layout="vertical"
          >
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码!' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="新密码" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                重置密码
              </Button>
            </Form.Item>
          </Form>
        );
      case 3:
        return (
          <div style={{ textAlign: 'center' }}>
            <Paragraph>密码已成功重置！</Paragraph>
            <Button type="primary">
              <Link to="/login">返回登录</Link>
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', marginTop: 64 }}>
      <Card bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>重置密码</Title>
        </div>

        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 24 }}
        >
          <Step title="账号验证" />
          <Step title="生日验证" />
          <Step title="重置密码" />
          <Step title="完成" />
        </Steps>

        {renderStepContent()}

        {currentStep < 3 && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/login">返回登录</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;