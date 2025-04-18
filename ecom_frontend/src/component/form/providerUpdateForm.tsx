import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ProviderUpdateProps {
  open: boolean;
  loading: boolean;
  initialValues: any;
  onCancel: () => void;
  onFinish: (values: any) => void;
}

const dummyRequest = ({ onSuccess }: any) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};

const ProviderUpdate: React.FC<ProviderUpdateProps> = ({ open, loading, initialValues, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  // When modal opens, set form values
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title="Update Course"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} onValuesChange={(changedValues, allValues) => {
        if (changedValues.price !== undefined) {
          form.setFieldsValue({ total_cost: changedValues.price });
        }
      }}>
        <Form.Item name="creator_id" label="Creator ID" hidden>
          <InputNumber />
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
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="max_capacity"
          label="Maximum Capacity"
          rules={[{ required: true, message: 'Please input maximum capacity!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
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
        </Form.Item>
        <Form.Item name="external_reference_number" label="External Reference Number">
          <Input placeholder="Enter external reference number" />
        </Form.Item> */}
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
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="total_cost"
          label="Total Cost (SGD)"
          // rules={[{ required: true, message: 'Please input total cost!' }]}
          hidden
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="tile_image_url"
          label="Course Image"
          valuePropName="fileList"
          extra="Upload course image"
        // rules={[{ required: true, message: 'Please upload course image!' }]}
        >
          <Upload customRequest={dummyRequest} listType="picture">
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Course
          </Button>
          <Button
            style={{ marginLeft: '8px' }}
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProviderUpdate;
