import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, message, Typography, Spin, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { contactAPI } from '../services/api';

const { Title } = Typography;

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 加载联系人数据
  const fetchContacts = async (page = 1, pageSize = 10, search = '') => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize
      };
      
      if (search) {
        params.search = search;
      }
      
      const response = await contactAPI.getContacts(params);
      setContacts(response.data);
      setPagination({
        ...pagination,
        current: page,
        total: response.headers['x-total-count'] || response.data.length
      });
    } catch (error) {
      console.error('获取联系人列表失败:', error);
      message.error('获取联系人列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(pagination.current, pagination.pageSize, searchText);
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '邮编',
      dataIndex: 'postal_code',
      key: 'postal_code',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个联系人吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理表格分页变化
  const handleTableChange = (pagination) => {
    fetchContacts(pagination.current, pagination.pageSize, searchText);
  };

  // 搜索联系人
  const handleSearch = () => {
    fetchContacts(1, pagination.pageSize, searchText);
  };

  // 添加新联系人
  const handleAdd = () => {
    setEditingContact(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 编辑联系人
  const handleEdit = (contact) => {
    setEditingContact(contact);
    form.setFieldsValue({
      name: contact.name,
      province: contact.province || '',
      city: contact.city || '',
      address: contact.address || '',
      postal_code: contact.postal_code || ''
    });
    setModalVisible(true);
  };

  // 删除联系人
  const handleDelete = async (id) => {
    try {
      await contactAPI.deleteContact(id);
      message.success('联系人已删除');
      fetchContacts(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error('删除联系人失败:', error);
      message.error('删除联系人失败');
    }
  };

  // 保存联系人（新增或更新）
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (editingContact) {
        // 更新现有联系人
        await contactAPI.updateContact(editingContact.id, values);
        message.success('联系人已更新');
      } else {
        // 创建新联系人
        await contactAPI.createContact(values);
        message.success('联系人已创建');
      }
      
      setModalVisible(false);
      fetchContacts(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error('保存联系人失败:', error);
      message.error('保存联系人失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card bordered={false}>
        <Title level={2}>联系人管理</Title>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input.Search
              placeholder="按姓名搜索联系人"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加联系人
            </Button>
          </Col>
        </Row>
        
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={contacts}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>
      
      {/* 添加/编辑联系人模态框 */}
      <Modal
        title={editingContact ? '编辑联系人' : '添加联系人'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="province"
            label="省份"
          >
            <Input placeholder="请输入省份" />
          </Form.Item>
          
          <Form.Item
            name="city"
            label="城市"
          >
            <Input placeholder="请输入城市" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="地址"
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>
          
          <Form.Item
            name="postal_code"
            label="邮编"
          >
            <Input placeholder="请输入邮政编码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactsPage;