import React from 'react';
import { Layout, Typography, Card, Button, theme } from 'antd';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const { token } = theme.useToken();

  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo" />
        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
          文章及用户管理系统
        </Typography.Title>
      </Header>
      <Content style={{ padding: '0 50px', minHeight: 'calc(100vh - 133px)' }}>
        <div className="site-layout-content" style={{ background: token.colorBgContainer, padding: 24, marginTop: 16 }}>
          <Card bordered={false}>
            <Title level={2}>欢迎使用文章及用户管理系统</Title>
            <Paragraph>
              这是一个Web全栈实践项目，基于React+Ant Design构建的前端和FastAPI后端。
            </Paragraph>
            <Paragraph>
              本系统提供以下功能:
            </Paragraph>
            <ul>
              <li>用户认证 - 注册/登录/修改密码</li>
              <li>联系人管理</li>
              <li>文章管理及统计</li>
              <li>主题切换</li>
            </ul>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" size="large">开始使用</Button>
            </div>
          </Card>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        文章及用户管理系统 ©{new Date().getFullYear()} Web全栈实践项目
      </Footer>
    </Layout>
  );
}

export default App;