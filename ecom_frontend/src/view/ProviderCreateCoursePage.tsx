import React, { useState } from 'react';
import { Form, Input, Button, message, InputNumber, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface userSessionObject {
  id: string;
  username: string;
  role: string;
}

const ProviderCreateCoursePage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Retrieve user session from localStorage
  const userString = sessionStorage.getItem('user');
  const user: userSessionObject | null = userString ? JSON.parse(userString) : null;
  const user_id = user?.id;
  console.log('User ID:', user_id);

  // Dummy upload function for demonstration; replace with your actual upload logic
  const dummyRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  // Normalize the uploaded file data
  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = async (values: any) => {
    values.total_cost = values.price; // because we do not have any discount factor here, just let them equal to each other first.
    values.creator_id = user_id;
    if (values.tile_image_url && Array.isArray(values.tile_image_url)) {
      values.tile_image_url = values.tile_image_url[0]?.name || '';
    }

    console.log("Form values to submit:", values);
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/createCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok) {
        message.success('Course created successfully!');
        form.resetFields();
      } else {
        message.error(data.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <h1>Create a New Course</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Creator ID (hidden) */}
        <Form.Item
          name="creator_id"
          initialValue={user_id}
          hidden
          rules={[{ required: true, message: 'Please input creator ID!' }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Course Title"
          rules={[{ required: true, message: 'Please input course title!' }]}
        >
          <Input placeholder="Enter course title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Course Description"
          rules={[{ required: true, message: 'Please input course description!' }]}
        >
          <Input.TextArea rows={4} placeholder="Enter course description" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price (SGD)"
          rules={[{ required: true, message: 'Please input course price!' }]}
        >
          <InputNumber placeholder="Enter price" min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="max_capacity"
          label="Maximum Capacity"
          rules={[{ required: true, message: 'Please input maximum capacity!' }]}
        >
          <InputNumber placeholder="Enter maximum capacity" min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: 'Please enter a category!' }]}
        >
          <Input placeholder="Enter category" />
        </Form.Item>

        {/* <Form.Item
          name="source"
          label="Course Source"
          rules={[{ required: true, message: 'Please select course source!' }]}
        >
          <Select placeholder="Select source">
            <Select.Option value="Internal">Internal</Select.Option>
            <Select.Option value="External">External</Select.Option>
          </Select>
        </Form.Item> */}

        {/* Removed External Reference Number */}

        <Form.Item
          name="training_provider_alias"
          label="Training Provider Alias"
        // rules={[{ required: true, message: 'Please input provider alias!' }]}
        >
          <Input placeholder="Enter training provider alias" />
        </Form.Item>

        <Form.Item
          name="total_training_hours"
          label="Total Training Hours"
          rules={[{ required: true, message: 'Please input training hours!' }]}
        >
          <InputNumber placeholder="Enter total training hours" min={1} style={{ width: '100%' }} />
        </Form.Item>

        {/* Removed Total Cost; it will be set equal to price */}

        <Form.Item
          name="tile_image_url"
          label="Course Image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="Upload course image"
          // rules={[{ required: true, message: 'Please upload course image!' }]}
        >
          <Upload customRequest={dummyRequest} listType="picture">
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Course
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProviderCreateCoursePage;
