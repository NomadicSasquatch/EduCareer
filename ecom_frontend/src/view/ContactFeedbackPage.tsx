import React, { useState } from "react";
import {
    Layout,
    Card,
    Form,
    Input,
    Button,
    Typography,
    Select,
    Upload,
    message
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import PORT from '../hooks/usePort';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
interface userSessionObject {
    id: string,
    username: string,
    role: string,
} 

const ContactUsPage: React.FC = () => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const userString = sessionStorage.getItem('user');
    const user: userSessionObject | null = userString ? JSON.parse(userString) : null;
    const user_id = user?.id;

    const onFinish = async (values: any) => {
        const feedbackData = { ...values, screenshot: fileList, user_id };
    
        try {
            const response = await fetch(`http://localhost:${PORT}/api/contactusfeedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(feedbackData),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                message.success(result.message);
                form.resetFields();
                setFileList([]);
            } else {
                message.error(result.error || "Submission failed");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            message.error("An error occurred while submitting your feedback.");
        }
    };    

    // Prevent automatic upload; we'll handle the file as a part of the form submission.
    const beforeUpload = (file: any) => {
        // You could add custom validation for file type/size here.
        return false;
    };

    const handleUploadChange = (info: any) => {
        // info.fileList is an array of uploaded files.
        setFileList(info.fileList);
    };

    return (
        <Layout style={{ minHeight: "100vh", background: "#fff" }}>
            <Content style={{ padding: "50px" }}>
                <Card
                    style={{
                        maxWidth: 600,
                        margin: "0 auto",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                    }}
                >
                    <Title level={2} style={{ textAlign: "center" }}>
                        Contact Us
                    </Title>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ feedbackType: "general" }}
                    >
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: "Please enter your name" }]}
                        >
                            <Input placeholder="Your name" />
                        </Form.Item>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Please enter your email" },
                                { type: "email", message: "Please enter a valid email" },
                            ]}
                        >
                            <Input placeholder="Your email" />
                        </Form.Item>

                        <Form.Item
                            label="Type"
                            name="feedbackType"
                            rules={[{ required: true, message: "Please select a type" }]}
                        >
                            <Select>
                                <Option value="bug">Bug Report</Option>
                                <Option value="feature">Feature Request</Option>
                                <Option value="general">General Feedback</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Subject"
                            name="subject"
                            rules={[{ required: true, message: "Please enter a subject" }]}
                        >
                            <Input placeholder="Subject" />
                        </Form.Item>

                        <Form.Item
                            label="Message"
                            name="message"
                            rules={[
                                { required: true, message: "Please enter your message" },
                            ]}
                        >
                            <Input.TextArea rows={6} placeholder="Your message" />
                        </Form.Item>

                        <Form.Item label="Screenshot (optional)">
                            <Upload
                                beforeUpload={beforeUpload}
                                onChange={handleUploadChange}
                                fileList={fileList}
                                listType="picture"
                            >
                                <Button icon={<UploadOutlined />}>Upload Screenshot</Button>
                            </Upload>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block>
                                Submit Feedback
                            </Button>
                        </Form.Item>

                        <Form.Item name="user_id" initialValue={user_id} hidden>
                            <Input />
                        </Form.Item>
                    </Form>
                </Card>
            </Content>
        </Layout>
    );
};

export default ContactUsPage;
