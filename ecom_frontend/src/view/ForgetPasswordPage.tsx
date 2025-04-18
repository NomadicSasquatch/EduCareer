import React, { useState } from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { showSuccessMessage, showErrorMessage } from '../utils/messageUtils';
import PORT from '../hooks/usePort';

type FieldType = {
    email: string;
};

const ForgetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:${PORT}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: values.email }),
            });

            const jsonData = await response.json();

            if (!response.ok) {
                showErrorMessage(`Request Failed: ${jsonData.error || 'Unknown error'}`);
                return;
            }

            showSuccessMessage('Password reset link sent! Check your email.');
        } catch (error) {
            showErrorMessage('Failed to connect to the server.');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Form submission failed:', errorInfo);
    };

    return (
        <Spin spinning={isLoading} size="large">
            <section style={{ justifyContent: 'center', display: 'flex', padding: '20px' }}>
                <Form<FieldType>
                    name="forgot-password"
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 16 }}
                    style={{ maxWidth: 600, margin: '50px' }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item<FieldType>
                        label="Email Address"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email!' },
                            { type: 'email', message: 'Invalid email format!' },
                        ]}
                    >
                        <Input style={{ width: '150%' }} />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Reset Password
                        </Button>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                            Back to Login
                        </Button>
                    </Form.Item>
                </Form>
            </section>
        </Spin>
    );
};

export default ForgetPasswordPage;
