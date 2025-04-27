import axios from 'axios';

// 创建 axios 实例
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加认证令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 认证相关 API
export const authAPI = {
  // 用户注册
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // 用户登录
  login: (username, password) => {
    // FastAPI 使用表单数据进行登录
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    return axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  // 修改密码
  changePassword: (passwordData) => {
    return api.post('/auth/change-password', passwordData);
  },

  // 验证生日以重置密码
  verifyBirthday: (username, birthday) => {
    return api.post('/auth/verify-birthday', { username, birthday });
  },

  // 重置密码
  resetPassword: (resetData) => {
    return api.post('/auth/reset-password', resetData);
  },
};

// 用户相关 API
export const userAPI = {
  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/users/me');
  },

  // 更新用户信息
  updateUser: (userData) => {
    return api.put('/users/me', userData);
  },

  // 上传头像
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // 获取作者详细信息
  getAuthorDetail: (authorId) => {
    return api.get(`/users/${authorId}`);
  },
};

// 联系人相关 API
export const contactAPI = {
  // 获取联系人列表
  getContacts: (params = {}) => {
    return api.get('/contacts', { params });
  },

  // 获取单个联系人
  getContact: (id) => {
    return api.get(`/contacts/${id}`);
  },

  // 创建联系人
  createContact: (contactData) => {
    return api.post('/contacts', contactData);
  },

  // 更新联系人
  updateContact: (id, contactData) => {
    return api.put(`/contacts/${id}`, contactData);
  },

  // 删除联系人
  deleteContact: (id) => {
    return api.delete(`/contacts/${id}`);
  },
};

// 文章相关 API
export const articleAPI = {
  // 获取文章列表
  getArticles: (params = {}) => {
    return api.get('/articles', { params });
  },

  // 获取单篇文章
  getArticle: (id) => {
    return api.get(`/articles/${id}`);
  },

  // 创建文章
  createArticle: (articleData) => {
    return api.post('/articles', articleData);
  },

  // 更新文章
  updateArticle: (id, articleData) => {
    return api.put(`/articles/${id}`, articleData);
  },

  // 删除文章
  deleteArticle: (id) => {
    return api.delete(`/articles/${id}`);
  },

  // 获取作者统计数据
  getAuthorStats: () => {
    return api.get('/articles/author/stats');
  },
  
  // 获取特定作者的文章
  getArticlesByAuthor: (authorId, params = {}) => {
    return api.get('/articles', { 
      params: { 
        author_id: authorId,
        ...params 
      } 
    });
  }
};

export default api;