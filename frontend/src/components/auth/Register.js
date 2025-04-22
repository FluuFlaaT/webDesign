import React, { useState } from 'react';
import { Form, Input, Button, DatePicker, Card, message, Typography, Upload, Avatar } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    // 确保密码匹配
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致！');
      return;
    }

    setLoading(true);
    try {
      // 格式化生日数据
      const formattedValues = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null
      };

      // 删除确认密码字段（后端不需要）
      delete formattedValues.confirmPassword;
      // 删除头像字段（将通过单独的API上传）
      delete formattedValues.avatar;

      // 发送注册请求
      const registerResponse = await authAPI.register(formattedValues);
      
      message.success('注册成功！请登录');
      
      // 如果有上传头像，则在注册成功后上传
      if (avatar) {
        try {
          // 注册成功后自动登录以便上传头像
          const loginFormData = new FormData();
          loginFormData.append('username', values.username);
          loginFormData.append('password', values.password);
          
          const loginResponse = await authAPI.login(values.username, values.password);
          
          // 设置令牌以便头像上传API调用
          localStorage.setItem('token', loginResponse.data.access_token);
          
          // 准备头像上传
          const avatarFormData = new FormData();
          avatarFormData.append('file', avatar);
          
          // 上传头像
          await fetch('http://localhost:8000/api/v1/users/avatar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${loginResponse.data.access_token}`,
            },
            body: avatarFormData
          });
          
          // 清除令牌以防止自动登录
          localStorage.removeItem('token');
          
          message.success('头像上传成功！');
        } catch (uploadError) {
          console.error('头像上传失败:', uploadError);
          message.warning('注册成功，但头像上传失败，请登录后再试');
          localStorage.removeItem('token'); // 确保清除任何令牌
        }
      }
      
      navigate('/login');
    } catch (error) {
      console.error('注册失败:', error);
      if (error.response && error.response.data) {
        message.error('注册失败: ' + error.response.data.detail);
      } else {
        message.error('注册失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传前的预览
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    
    // 设置预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    // 保存文件对象以便后续上传
    setAvatar(file);
    
    // 返回false阻止自动上传
    return false;
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', marginTop: 64 }}>
      <Card bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>用户注册</Title>
        </div>
        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          {/* 头像上传 */}
          <Form.Item
            name="avatar"
            label="头像"
          >
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                beforeUpload={beforeUpload}
              >
                {previewUrl ? (
                  <Avatar 
                    src={previewUrl}
                    size={80}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传头像</div>
                  </div>
                )}
              </Upload>
            </div>
          </Form.Item>
          
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名!' },
              { min: 3, message: '用户名至少3个字符' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="电子邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            rules={[
              { required: true, message: '请确认密码!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item name="birthday" label="生日 (可选)">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <span>已有账号？</span>
            <Link to="/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;