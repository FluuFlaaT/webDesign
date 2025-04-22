import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const { Title } = Typography;

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    // 确保新密码和确认密码匹配
    if (values.newPassword !== values.confirmPassword) {
      message.error('确认密码与新密码不一致！');
      return;
    }

    setLoading(true);
    try {
      const passwordData = {
        username: user.username,
        old_password: values.oldPassword,
        new_password: values.newPassword
      };

      await authAPI.changePassword(passwordData);
      message.success('密码修改成功！');
      form.resetFields();
    } catch (error) {
      console.error('修改密码失败:', error);
      if (error.response && error.response.data) {
        message.error('修改密码失败: ' + error.response.data.detail);
      } else {
        message.error('修改密码失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', marginTop: 32 }}>
      <Card bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>修改密码</Title>
        </div>
        <Form
          form={form}
          name="changePassword"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            initialValue={user?.username}
          >
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>
          
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
          </Form.Item>

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
            label="确认密码"
            rules={[
              { required: true, message: '请确认新密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的新密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              修改密码
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;