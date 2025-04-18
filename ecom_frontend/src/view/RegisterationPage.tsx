import React, { useState } from 'react';
import { Button, Form, Input, Row, Col, Tabs, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PORT from '../hooks/usePort';
import { showSuccessMessage, showErrorMessage } from '../utils/messageUtils';

const { TabPane } = Tabs;

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const autoLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const jsonData = await response.json();
      if (!response.ok) {
        showErrorMessage(`Login Failed: ${jsonData.error || 'Unknown error'}`);
        return;
      }
      sessionStorage.setItem('user', JSON.stringify(jsonData.user));
      showSuccessMessage('Successfully logged in!');
      navigate('/');
      window.location.reload();
    } catch (error) {
      showErrorMessage('Failed to connect to the server during auto-login.');
      console.error('Auto-login error:', error);
    }
  };

  const onFinishLearner = async (values: any) => {
    console.log('Learner Registration Success:', values);
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:${PORT}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          role: 'learner',
          phone_number: values.phoneNumber,
          firstName: values.firstName,
          lastName: values.lastName,
          cover_image_url: '',
          profile_image_url: '',
          occupation: '',
          company_name: '',
          about_myself: ''
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showErrorMessage(data.error || 'Registration failed.');
        return;
      }
      showSuccessMessage('Registration successful, logging you in...');
      await autoLogin(values.username, values.password);
    } catch (error) {
      showErrorMessage('Registration failed due to network error.');
      console.error('Error during registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailedLearner = (errorInfo: object) => {
    console.error('Learner Registration Failed:', errorInfo);
    showErrorMessage('Please check your learner registration input!');
  };

  const onFinishProvider = async (values: any) => {
    console.log('Provider Registration Success:', values);
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:${PORT}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          password: values.password,
          role: 'provider',
          phone_number: values.phoneNumber,
          lecture_team_id: values.lectureTeamID,
          organization_name: values.organization,
          address: ''
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showErrorMessage(data.error || 'Registration failed.');
        return;
      }
      showSuccessMessage('Registration successful, logging you in...');
      await autoLogin(values.username, values.password);
    } catch (error) {
      showErrorMessage('Registration failed due to network error.');
      console.error('Error during provider registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailedProvider = (errorInfo: object) => {
    console.error('Provider Registration Failed:', errorInfo);
    showErrorMessage('Please check your provider registration input!');
  };

  const ProviderForm = () => {
    return (
      <Form
        name="provider_registration_form"
        layout="vertical"
        onFinish={onFinishProvider}
        onFinishFailed={onFinishFailedProvider}
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'First Name is required!' }]}
            >
              <Input placeholder="Enter your first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Last Name is required!' }]}
            >
              <Input placeholder="Enter your last name" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: 'Username is required!' }]}
        >
          <Input placeholder="Enter a username" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email', message: 'Please enter a valid email!' },
            { required: true, message: 'Email is required!' },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>
        {/* <Form.Item label="LectureTeam ID" name="lectureTeamID">
          <Input
            placeholder="Enter your LectureTeam ID"
            addonAfter={<Button icon={<SearchOutlined />} />}
          />
        </Form.Item> */}
        <Form.Item
          name="organization"
          label="Organization Name"
          rules={[{ required: true, message: 'Organization name is required!' }]}
        >
          <Input placeholder="Organization name" />
        </Form.Item>
        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[
            { required: true, message: 'Phone Number is required!' },
            { pattern: /^\d{8}$/, message: 'Phone Number must be 8 digits!' },
          ]}
        >
          <Input placeholder="Enter your phone number" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Password is required!' }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm your password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Register as Provider
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const LearnerForm = () => (
    <Form
      name="learner_registration_form"
      layout="vertical"
      onFinish={onFinishLearner}
      onFinishFailed={onFinishFailedLearner}
      style={{ maxWidth: '500px', width: '100%' }}
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: 'Username is required!' }]}
      >
        <Input placeholder="Enter a username" />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'First Name is required!' }]}
          >
            <Input placeholder="Enter your first name" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Last Name is required!' }]}
          >
            <Input placeholder="Enter your last name" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { type: 'email', message: 'Please enter a valid email!' },
          { required: true, message: 'Email is required!' },
        ]}
      >
        <Input placeholder="Enter your email" />
      </Form.Item>
      <Form.Item
        name="phoneNumber"
        label="Phone Number"
        rules={[
          { required: true, message: 'Phone Number is required!' },
          { pattern: /^\d{8}$/, message: 'Phone Number must be 8 digits!' },
        ]}
      >
        <Input placeholder="Enter your phone number" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Password is required!' }]}
      >
        <Input.Password placeholder="Enter your password" />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="Confirm Password"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm your password" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Register as Learner
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <Spin spinning={isLoading} size="large">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: '#f0f2f5',
          padding: '20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <Tabs defaultActiveKey="learner" centered>
            <TabPane tab="Learner" key="learner">
              <LearnerForm />
            </TabPane>
            <TabPane tab="Provider" key="provider">
              <ProviderForm />
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Spin>
  );
};

export default RegistrationPage;
