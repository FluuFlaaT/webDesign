import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Row, Col, Avatar, Descriptions, Button, Statistic, DatePicker, Form, Input, message, Modal } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined, CalendarOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import moment from 'moment';
import 'moment/locale/zh-cn'; // 引入中文本地化

// 设置 moment 本地化为中文
moment.locale('zh-cn');

const { Title, Text } = Typography;

// 自定义日期格式化函数，增强健壮性
const formatDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return '未设置';
  const m = moment(dateString);
  return m.isValid() ? m.format(format) : '无效日期';
};

// 日期解析函数，确保一致的日期处理
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const m = moment(dateString);
  if (!m.isValid()) return null;
  
  return m;
};

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getCurrentUser();
      // 更新全局用户状态
      updateUser(response.data);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    console.log('当前用户生日:', user?.birthday);
    
    // 填充表单，使用parseDate函数处理日期，确保转换的一致性
    form.setFieldsValue({
      email: user?.email || '',
      birthday: user?.birthday ? parseDate(user.birthday) : null,
    });
    
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 准备提交数据
      const userData = { ...values };
      
      // 使用moment格式化生日，确保格式一致
      if (userData.birthday) {
        // 确保生日是moment对象后再格式化
        userData.birthday = moment.isMoment(userData.birthday) 
          ? userData.birthday.format('YYYY-MM-DD')
          : moment(userData.birthday).format('YYYY-MM-DD');
      }
      
      console.log('提交的生日数据:', userData.birthday);
      
      // 更新用户信息
      await userAPI.updateUser(userData);
      message.success('用户信息更新成功');
      
      // 重新获取用户信息
      await fetchUserInfo();
      setEditModalVisible(false);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      message.error('更新用户信息失败: ' + (error.response?.data?.detail || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setUploadModalVisible(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件类型和大小
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG格式的图片');
      return;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB');
      return;
    }
    
    // 预览图片
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };

  const handleAvatarSubmit = async () => {
    if (!avatarFile) {
      message.warning('请先选择一张图片');
      return;
    }
    
    try {
      setLoading(true);
      await userAPI.uploadAvatar(avatarFile);
      message.success('头像上传成功');
      
      // 重新获取用户信息
      await fetchUserInfo();
      setUploadModalVisible(false);
    } catch (error) {
      console.error('头像上传失败:', error);
      message.error('头像上传失败');
    } finally {
      setLoading(false);
    }
  };

  // 查找当前用户的文章统计
  const currentUserStats = authorStats.find(stat => stat.author_id === user?.id) || { article_count: 0 };

  return (
    <div>
      <Spin spinning={loading}>
        <Card bordered={false}>
          <Title level={2}>个人信息</Title>
          
          <Row gutter={24} style={{ marginTop: 24 }}>
            <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                src={user?.avatar_url} 
                icon={<UserOutlined />} 
              />
              <div style={{ marginTop: 16 }}>
                <Button 
                  icon={<EditOutlined />} 
                  onClick={handleAvatarUpload}
                >
                  更换头像
                </Button>
              </div>
            </Col>
            
            <Col xs={24} sm={16}>
              <Descriptions 
                title="基本信息" 
                bordered 
                column={{ xs: 1, sm: 2 }}
                extra={
                  <Button 
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEdit}
                  >
                    编辑信息
                  </Button>
                }
              >
                <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{user?.email}</Descriptions.Item>
                <Descriptions.Item label="生日">
                  {formatDate(user?.birthday)}
                </Descriptions.Item>
                <Descriptions.Item label="账户余额">
                  <Text type={user?.balance > 0 ? 'success' : 'secondary'}>
                    ¥ {user?.balance?.toFixed(2)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="注册时间" span={2}>
                  {formatDate(user?.created_at, 'YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Row gutter={24} style={{ marginTop: 32 }}>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="文章数量"
                  value={user?.articles?.length || 0}
                  prefix={<span role="img" aria-label="article">📝</span>}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="联系人数量"
                  value={user?.contacts?.length || 0}
                  prefix={<span role="img" aria-label="contacts">👥</span>}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="最近登录"
                  value={formatDate(moment(), 'YYYY-MM-DD')}
                  prefix={<span role="img" aria-label="login">🔑</span>}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>

      {/* 编辑用户信息模态框 */}
      <Modal
        title="编辑个人信息"
        open={editModalVisible}
        onOk={handleUpdateUser}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="电子邮箱" />
          </Form.Item>
          
          <Form.Item
            name="birthday"
            label="生日"
          >
            <DatePicker 
              style={{ width: '100%' }} 
              prefix={<CalendarOutlined />}
              format="YYYY-MM-DD"
              placeholder="请选择生日"
              inputReadOnly={true}
              disabledDate={current => current && current > moment().endOf('day')}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              popupStyle={{ zIndex: 1050 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传头像模态框 */}
      <Modal
        title="上传头像"
        open={uploadModalVisible}
        onOk={handleAvatarSubmit}
        onCancel={() => setUploadModalVisible(false)}
        confirmLoading={loading}
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {avatarPreview ? (
            <Avatar size={120} src={avatarPreview} />
          ) : (
            <Avatar size={120} icon={<UserOutlined />} />
          )}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <input
            type="file"
            accept="image/jpeg,image/png"
            style={{ display: 'none' }}
            id="avatar-upload"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload">
            <Button icon={<UploadOutlined />} as="span">
              选择图片
            </Button>
          </label>
          <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
            支持 JPG、PNG 格式，最大 2MB
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;