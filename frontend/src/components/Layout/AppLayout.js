import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Dropdown, Space } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Header, Sider, Content, Footer } = Layout;

const AppLayout = ({ children, toggleTheme, isDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 调试用户信息
  console.log('当前用户信息:', user);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 适配新版Ant Design的Dropdown API
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile')
    },
    {
      key: 'changePassword',
      icon: <SettingOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme={isDarkMode ? 'dark' : 'light'}>
        <div className="logo" style={{ height: 64, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ color: isDarkMode ? 'white' : 'black', margin: 0 }}>
            {collapsed ? '文管' : '文章管理系统'}
          </h2>
        </div>
        <Menu
          theme={isDarkMode ? 'dark' : 'light'}
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={[
            {
              key: 'dashboard',
              icon: <BarChartOutlined />,
              label: <Link to="/dashboard">数据统计</Link>,
            },
            {
              key: 'articles',
              icon: <BookOutlined />,
              label: <Link to="/articles">文章管理</Link>,
            },
            {
              key: 'contacts',
              icon: <TeamOutlined />,
              label: <Link to="/contacts">联系人管理</Link>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Space style={{ marginRight: 20 }}>
            <Button 
              type={isDarkMode ? "default" : "primary"} 
              onClick={toggleTheme}
            >
              {isDarkMode ? "蓝色主题" : "黄色主题"}
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {/* 使用user直接获取avatar_url，已在AuthContext中处理过URL */}
                {user && user.avatar_url ? (
                  <>
                    <Avatar 
                      size="default"
                      src={user.avatar_url}
                      style={{ 
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #d9d9d9'
                      }}
                    />
                    <span style={{ marginLeft: 8 }}>{user.username}</span>
                  </>
                ) : (
                  <>
                    <Avatar 
                      size="default"
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                    <span style={{ marginLeft: 8 }}>{user?.username}</span>
                  </>
                )}
              </span>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          文章及用户管理系统 ©{new Date().getFullYear()} Web全栈实践项目
        </Footer>
      </Layout>
    </Layout>
  );
};

export default AppLayout;