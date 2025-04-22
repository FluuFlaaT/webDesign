import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import moment from 'moment';
import 'moment/locale/zh-cn';

// 设置moment本地化为中文
moment.locale('zh-cn');

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 第一步：验证用户名和生日
  const verifyIdentity = async (values) => {
    setLoading(true);
    try {
      // 使用moment格式化日期
      const formattedDate = values.birthday.format('YYYY-MM-DD');
      const response = await authAPI.verifyBirthday(values.username, formattedDate);
      
      message.success('身份验证成功！');
      setUsername(values.username);
      setCurrentStep(1);
    } catch (error) {
      console.error('身份验证失败:', error);
      if (error.response && error.response.data) {
        message.error('验证失败: ' + error.response.data.detail);
      } else {
        message.error('用户名或生日不匹配，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 第二步：设置新密码
  const resetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    setLoading(true);
    try {
      // 调用重置密码API
      await authAPI.resetPassword({
        username: username,
        new_password: values.newPassword
      });
      
      message.success('密码已成功重置，请使用新密码登录');
      setCurrentStep(2);
    } catch (error) {
      console.error('重置密码失败:', error);
      if (error.response && error.response.data) {
        message.error('重置失败: ' + error.response.data.detail);
      } else {
        message.error('重置密码失败，请重试');
      }
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
            name="identityVerification"
            onFinish={verifyIdentity}
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
              name="birthday"
              label="生日"
              rules={[{ required: true, message: '请选择您的生日!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                prefix={<CalendarOutlined />}
                placeholder="请选择您注册时填写的生日"
                format="YYYY-MM-DD"
                disabledDate={current => current && current > moment().endOf('day')}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                验证身份
              </Button>
            </Form.Item>
          </Form>
        );
      case 1:
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
      case 2:
        return (
          <div style={{ textAlign: 'center' }}>
            <Paragraph>密码已成功重置！</Paragraph>
            <Button type="primary" onClick={() => navigate('/login')}>
              返回登录
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
          <Step title="验证身份" />
          <Step title="重置密码" />
          <Step title="完成" />
        </Steps>

        {renderStepContent()}

        {currentStep < 2 && (
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Link to="/login">返回登录</Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;