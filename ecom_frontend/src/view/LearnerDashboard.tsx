import React, { useState, useEffect } from 'react';
import { Layout, List, Card, Progress, Typography, Spin, message, Button, Modal, Input } from 'antd';
import { FileDoneOutlined, LoadingOutlined } from '@ant-design/icons';
import { useSession } from '../hooks/useSession';
import { useNavigate } from 'react-router-dom';
import PORT from '../hooks/usePort';

const { Content } = Layout;
const { Title, Text } = Typography;

export type EnrolledCourse = {
  enrollment_id: number;
  completion_percentage: number;
  enrolled_at: string;
  course: {
    course_id: number;
    name: string;
    description?: string;
    tile_image_url?: string;
    total_training_hours?: number;
    price?: number;
  };
  modules?: {
    module_id: number;
    module_name: string;
    progress: number;
    status: 'not_started' | 'in_progress' | 'completed';
  }[];
};

const LearnerDashboard: React.FC = () => {
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useSession();
  const navigate = useNavigate();

  // State for certificate modal
  const [certificateModalVisible, setCertificateModalVisible] = useState<boolean>(false);
  const [certificateEmail, setCertificateEmail] = useState<string>('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrolledCourse | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:${PORT}/api/learnerDashboard?learnerId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        const mappedEnrollments: EnrolledCourse[] = data.enrollments.map((item: any) => ({
          enrollment_id: item.enrollment_id,
          completion_percentage: item.completion_percentage,
          enrolled_at: item.enrolled_at,
          course: {
            course_id: item.course_id,
            name: item.name,
            description: item.description,
            tile_image_url: item.tile_image_url,
            total_training_hours: item.total_training_hours,
            price: item.price,
          },
          modules: item.modules || [],
        }));
        setEnrollments(mappedEnrollments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        message.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleCardClick = (enrollmentId: number) => {
    navigate(`/course-module-detail/${enrollmentId}`);
  };

  // Open certificate modal for the selected enrollment
  const openCertificateModal = (enrollment: EnrolledCourse) => {
    setSelectedEnrollment(enrollment);
    setCertificateModalVisible(true);
  };

  const closeCertificateModal = () => {
    setCertificateModalVisible(false);
    setCertificateEmail('');
    setSelectedEnrollment(null);
  };

  const handleSendCertificate = async () => {
    if (!certificateEmail) {
      message.error('Please enter an email address.');
      return;
    }
    if (!selectedEnrollment) return;
    try {
      const certificateData = {
        email: certificateEmail,
        username: user?.username || 'Learner',
        course: selectedEnrollment.course.name,
        date: new Date().toLocaleDateString(),
      };
      const res = await fetch(`http://localhost:${PORT}/api/certificate/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certificateData),
      });
      if (!res.ok) {
        throw new Error('Failed to send certificate');
      }
      const result = await res.json();
      message.success("Certificate emailed successfully!");
      console.log(result);
      closeCertificateModal();
    } catch (error) {
      console.error("Error sending certificate:", error);
      message.error("Error sending certificate");
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Learner Dashboard</Title>
        {loading ? (
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        ) : enrollments.length === 0 ? (
          <Text>No enrollments found. Start exploring courses!</Text>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={enrollments}
            renderItem={(item) => (
              <List.Item key={item.enrollment_id}>
                <Card
                  hoverable
                  onClick={() => handleCardClick(item.enrollment_id)}
                  cover={
                    item.course?.tile_image_url ? (
                      <img
                        alt={item.course?.name}
                        src={item.course?.tile_image_url}
                        style={{ height: 150, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 150,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f0f0f0',
                        }}
                      >
                        <FileDoneOutlined style={{ fontSize: 48 }} />
                      </div>
                    )
                  }
                >
                  <Card.Meta title={item.course?.name} description={item.course?.description} />
                  <div style={{ marginTop: '16px' }}>
                    <Text>Progress: </Text>
                    <Progress percent={Number(item.completion_percentage)} />
                  </div>
                  {Number(item.completion_percentage) === 100 && (
                    <div style={{ marginTop: '16px' }}>
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigation
                          openCertificateModal(item);
                        }}
                      >
                        Email My Certificate
                      </Button>
                    </div>
                  )}
                </Card>
              </List.Item>
            )}
          />
        )}

        <Modal
          visible={certificateModalVisible}
          title="Enter Email for Certificate"
          onCancel={closeCertificateModal}
          footer={[
            <Button key="cancel" onClick={closeCertificateModal}>
              Cancel
            </Button>,
            <Button key="send" type="primary" onClick={handleSendCertificate}>
              Send Certificate
            </Button>,
          ]}
        >
          <Input
            placeholder="Enter your email address"
            value={certificateEmail}
            onChange={(e) => setCertificateEmail(e.target.value)}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default LearnerDashboard;
