import React, { useState } from 'react';
import { Form, Input, Button, message, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import PORT from '../hooks/usePort';

const { Content } = Layout;

const AdminCreationPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const [firstName, ...rest] = values.name.trim().split(' ');
      const lastName = rest.join(' ');
      console.log(values)

      const response = await fetch(`http://localhost:${PORT}/api/useraccounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password_hash: values.password, 
          first_name: firstName,
          last_name: lastName,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.error(`Error: ${data.error || data.message}`);
        return;
      }

      message.success('Admin account created successfully!');
      navigate('/AdminManagementPage');
    } catch (error) {
      message.error('Failed to create admin account.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ color: '#fff' }}>Create New Admin Account</h2>
        <Form
        name="create-admin"
        onFinish={onFinish}
        initialValues={{ remember: true }}
        layout="vertical"
        style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}
        >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input the admin name!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input the username!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input the email!' },
            { type: 'email', message: 'The input is not a valid email!' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input the password!' }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Create Admin
          </Button>
        </Form.Item>
      </Form>
      </Content>
    </Layout>
  );
};

export default AdminCreationPage;
