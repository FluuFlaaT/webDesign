import React from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
  return (
    <Card style={{ maxWidth: 500, margin: '64px auto' }}>
      <Typography.Title level={2}>找回密码</Typography.Title>
      <Typography.Paragraph>
        为保护账户安全，已停用通过生日找回密码。忘记密码时请联系管理员核实身份。
        如果记得原密码，可登录后使用修改密码功能。
      </Typography.Paragraph>
      <Link to="/login">返回登录</Link>
    </Card>
  );
}
