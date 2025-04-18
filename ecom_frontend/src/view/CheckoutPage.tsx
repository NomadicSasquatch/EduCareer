import React, { useState, useEffect } from 'react';
import { Layout, Card, Steps, Typography, Row, Col, Form, Input, Button, Divider, Result, message } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

type Course = {
  courseId: number;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  category?: string;
  provider?: string;
  date?: string;
  price?: number;
  externalReferenceNumber?: string;
  source?: string;
};

const CheckoutPage: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Get selected course from localStorage
    const selectedCourseJson = localStorage.getItem('selectedCourse');
    if (selectedCourseJson) {
      try {
        const selectedCourse = JSON.parse(selectedCourseJson);
        setCourse(selectedCourse);
        
        // Automatically skip to confirmation for free courses
        if (Number(selectedCourse.price) === 0 || !selectedCourse.price) {
          setCurrentStep(2);
        }
      } catch (error) {
        console.error('Error parsing selected course:', error);
        message.error('Error loading course information');
        navigate('/searchCourse');
      }
    } else {
      message.warning('No course selected for checkout');
      navigate('/searchCourse');
    }
  }, [navigate]);

  useEffect(() => {
    if (currentStep === 2 && course) {
      handleEnrollment();
    }
  }, [currentStep]);

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePaymentSubmit = async (values: any) => {
    setLoading(true);
    
    // Simulate payment processing
    // In a real app, you would call an API to process the payment
    setTimeout(() => {
      setLoading(false);
      message.success('Payment processed successfully');
      handleNextStep();
    }, 1500);
  };

  const handleEnrollment = async () => {
    try {
      if (!course) return;
      
      // Get user info from session storage
      const userJson = sessionStorage.getItem('user');
      if (!userJson) {
        message.error('User information not found');
        navigate('/login');
        return;
      }
      
      const user = JSON.parse(userJson);
      
      // Create enrollment in the database
      const response = await fetch(`http://localhost:5000/api/courses/${course.courseId}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          course_id: course.courseId,
          completion_percentage: 0.00,
          is_kicked: 0
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }
      
      localStorage.setItem('enrollmentComplete', 'true');
      message.success('Successfully enrolled in course! A receipt has been sent to your email.');
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      message.error('Failed to complete enrollment. Please try again.');
    }
  };

  const handleGoToHomepage = () => {
    localStorage.removeItem('selectedCourse');
    localStorage.removeItem('enrollmentComplete');
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Card style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Steps current={currentStep} style={{ marginBottom: '24px' }}>
            <Step title="Review" icon={<ShoppingCartOutlined />} />
            <Step title="Payment" icon={<CreditCardOutlined />} />
            <Step title="Confirmation" icon={<CheckCircleOutlined />} />
          </Steps>

          {/* Step 1: Review Order */}
          {currentStep === 0 && (
            <>
              <Title level={3}>Review Your Order</Title>
              {course && (
                <Card type="inner" style={{ marginBottom: '24px' }}>
                  <Title level={4}>{course.title}</Title>
                  <Paragraph>{course.description}</Paragraph>
                  
                  <Row style={{ marginTop: '16px' }}>
                    <Col span={12}><Text strong>Instructor:</Text> {course.instructor}</Col>
                    <Col span={12}><Text strong>Provider:</Text> {course.provider}</Col>
                  </Row>
                  <Row style={{ marginTop: '8px' }}>
                    <Col span={12}><Text strong>Duration:</Text> {course.duration}</Col>
                    <Col span={12}><Text strong>Category:</Text> {course.category}</Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row justify="space-between" style={{ marginTop: '16px' }}>
                    <Col><Title level={5}>Total:</Title></Col>
                    <Col><Title level={5}>{(Number(course.price) === 0 || !course.price) ? 'Free' : `$${course.price}`}</Title></Col>
                  </Row>
                </Card>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                <Button onClick={() => navigate('/searchCourse')}>Back to Search</Button>
                <Button type="primary" onClick={handleNextStep}>Proceed to Payment</Button>
              </div>
            </>
          )}

          {/* Step 2: Payment Information */}
          {currentStep === 1 && (
            <>
              <Title level={3}>Payment Information</Title>
              <Form
                form={form}
                layout="vertical"
                onFinish={handlePaymentSubmit}
              >
                <Form.Item
                  label="Cardholder Name"
                  name="cardholderName"
                  rules={[{ required: true, message: 'Please enter the cardholder name' }]}
                >
                  <Input placeholder="John Doe" />
                </Form.Item>
                
                <Form.Item
                  label="Card Number"
                  name="cardNumber"
                  rules={[{ required: true, message: 'Please enter the card number' }]}
                >
                  <Input placeholder="1234 5678 9012 3456" />
                </Form.Item>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Expiration Date"
                      name="expirationDate"
                      rules={[{ required: true, message: 'Please enter expiration date' }]}
                    >
                      <Input placeholder="MM/YY" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="CVC"
                      name="cvc"
                      rules={[{ required: true, message: 'Please enter CVC' }]}
                    >
                      <Input placeholder="123" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item
                  label="Billing Address"
                  name="billingAddress"
                  rules={[{ required: true, message: 'Please enter your billing address' }]}
                >
                  <Input.TextArea placeholder="Enter your billing address" rows={3} />
                </Form.Item>
                
                <Divider />
                
                {course && (
                  <Row justify="space-between" style={{ marginBottom: '24px' }}>
                    <Col><Text strong>Total Amount:</Text></Col>
                    <Col><Text strong>{(Number(course.price) === 0 || !course.price) ? 'Free' : `$${course.price}`}</Text></Col>
                  </Row>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handlePreviousStep}>Back</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Complete Payment
                  </Button>
                </div>
              </Form>
            </>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 2 && (
            <Result
              status="success"
              title="Payment Successful!"
              subTitle="You have successfully enrolled in the course."
              extra={[
                <Button type="primary" key="dashboard" onClick={handleGoToHomepage}>
                  Go to My Courses
                </Button>
              ]}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default CheckoutPage;