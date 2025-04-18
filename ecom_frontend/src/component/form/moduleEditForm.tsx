import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button } from 'antd';

interface ModuleEditFormProps {
  open: boolean;
  loading: boolean;
  initialValues: any;
  onCancel: () => void;
  onFinish: (values: any) => void;
}

const ModuleEditForm: React.FC<ModuleEditFormProps> = ({ open, loading, initialValues, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title="Edit Course Module"
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="module_name"
          label="Module Name"
          rules={[{ required: true, message: 'Please input the module name!' }]}
        >
          <Input placeholder="Enter module name" />
        </Form.Item>
        <Form.Item
          name="module_description"
          label="Module Description"
          rules={[{ required: true, message: 'Please input the module description!' }]}
        >
          <Input.TextArea rows={4} placeholder="Enter module description" />
        </Form.Item>
        <Form.Item
          name="module_order"
          label="Module Order"
          rules={[{ required: true, message: 'Please input the module order!' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Module
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

export default ModuleEditForm;
