import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';

// 导入上下文提供者
import { AuthProvider, useAuth } from './context/AuthContext';

// 导入布局组件
import AppLayout from './components/Layout/AppLayout';

// 导入认证相关组件
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChangePassword from './components/auth/ChangePassword';
import ResetPassword from './components/auth/ResetPassword';

// 导入功能页面
import ContactsPage from './pages/ContactsPage';
import ArticlesPage from './pages/ArticlesPage';
import DashboardPage from './pages/DashboardPage';
import AuthorArticlesPage from './pages/AuthorArticlesPage';

// 蓝色和黄色主题配置
const blueTheme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
};

const yellowTheme = {
  token: {
    colorPrimary: '#faad14',
    borderRadius: 6,
  },
};

// 需要认证的路由守卫组件
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 未认证路由守卫组件（已登录用户无法访问登录和注册页面）
const UnprotectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// 应用程序主组件
const AppContent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [useYellowTheme, setUseYellowTheme] = useState(false);

  // 切换主题
  const toggleTheme = () => {
    setUseYellowTheme(!useYellowTheme);
  };

  return (
    <ConfigProvider
      locale={zhCN}
      theme={
        useYellowTheme
          ? yellowTheme
          : blueTheme
      }
    >
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <UnprotectedRoute>
                <Login />
              </UnprotectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <UnprotectedRoute>
                <Register />
              </UnprotectedRoute>
            }
          />
          {/* 新增密码重置路由 */}
          <Route
            path="/reset-password"
            element={
              <UnprotectedRoute>
                <ResetPassword />
              </UnprotectedRoute>
            }
          />

          {/* 需要认证的路由 */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout toggleTheme={toggleTheme} isDarkMode={useYellowTheme}>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/articles"
            element={
              <ProtectedRoute>
                <AppLayout toggleTheme={toggleTheme} isDarkMode={useYellowTheme}>
                  <ArticlesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* 作者文章详情页路由 */}
          <Route
            path="/articles/author/:authorId"
            element={
              <ProtectedRoute>
                <AppLayout toggleTheme={toggleTheme} isDarkMode={useYellowTheme}>
                  <AuthorArticlesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <AppLayout toggleTheme={toggleTheme} isDarkMode={useYellowTheme}>
                  <ContactsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <AppLayout toggleTheme={toggleTheme} isDarkMode={useYellowTheme}>
                  <ChangePassword />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 未找到路由 */}
          <Route path="*" element={<div>404 - 页面不存在</div>} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

// 应用程序入口
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;