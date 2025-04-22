import React, { createContext, useState, useContext, useEffect } from 'react';
import moment from 'moment';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
  const BASE_URL = API_BASE_URL.split('/api/v1')[0]; // 获取基础URL

  useEffect(() => {
    // 如果有token，尝试获取用户信息
    const fetchUserInfo = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            
            // 处理头像URL
            if (userData.avatar_url) {
              // 如果不是完整URL，添加基础URL
              if (!userData.avatar_url.startsWith('http')) {
                userData.avatar_url = `${BASE_URL}${userData.avatar_url}`;
              }
              
              // 添加时间戳防止缓存，使用moment获取时间戳
              userData.avatar_url = `${userData.avatar_url}?t=${moment().valueOf()}`;
            }
            
            setUser(userData);
            console.log('用户数据加载成功:', userData);
          } else {
            // 如果令牌无效，清除本地存储
            console.error('获取用户信息失败: 无效的令牌');
            logout();
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [token]);

  // 登录
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    // 处理头像URL
    if (userData && userData.avatar_url) {
      // 如果不是完整URL，添加基础URL
      if (!userData.avatar_url.startsWith('http')) {
        userData.avatar_url = `${BASE_URL}${userData.avatar_url}`;
      }
    }
    
    setUser(userData);
    console.log('用户登录成功:', userData);
  };

  // 注销
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // 更新用户信息
  const updateUser = (updatedUser) => {
    // 处理头像URL
    if (updatedUser && updatedUser.avatar_url && !updatedUser.avatar_url.startsWith('http')) {
      updatedUser.avatar_url = `${BASE_URL}${updatedUser.avatar_url}`;
    }
    
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};