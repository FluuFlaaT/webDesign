import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [form] = Form.useForm();

  // 第一步：请求重置密码
  const requestReset = async (values) => {
    setLoading(true);
    try {
      // 这里应该调用后端API来发送重置邮件
      // 由于这是一个模拟实现，我们只是假装发送了重置邮件
      message.success('重置密码链接已发送到您的邮箱，请查收！');
      setEmail(values.email);
      setCurrentStep(1);
    } catch (error) {
      console.error('请求重置密码失败:', error);
      message.error('发送重置邮件失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 第二步：验证重置码
  const verifyCode = async (values) => {
    setLoading(true);
    try {
      // 这里应该调用后端API来验证重置码
      // 由于这是一个模拟实现，我们只是假装验证了重置码
      setResetCode(values.resetCode);
      setCurrentStep(2);
      message.success('验证码验证成功，请设置新密码');
    } catch (error) {
      console.error('验证重置码失败:', error);
      message.error('验证码无效或已过期，请重试');
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
                获取重置链接
              </Button>
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <Form
            form={form}
            name="verifyCode"
            onFinish={verifyCode}
            layout="vertical"
          >
            <Paragraph>
              我们已向 {email} 发送了一封包含验证码的邮件。请检查您的收件箱并输入验证码。
            </Paragraph>
            <Form.Item
              name="resetCode"
              label="验证码"
              rules={[{ required: true, message: '请输入验证码!' }]}
            >
              <Input placeholder="请输入6位验证码" />
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
          <Step title="提交邮箱" />
          <Step title="验证身份" />
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