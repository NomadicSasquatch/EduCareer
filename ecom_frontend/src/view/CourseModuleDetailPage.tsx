import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, List, Card, Progress, Button, Typography, message, Modal } from 'antd';
import { FileDoneOutlined } from '@ant-design/icons';
import PORT from '../hooks/usePort';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

type Module = {
  module_id: number;
  module_name: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  module_description?: string;
};

type EnrollmentModulesData = {
  course_name: string;
  enrollment_id: number;
  completion_percentage: number;
  modules: Module[];
};

const CourseModuleDetail: React.FC = () => {
  const { enrollmentId } = useParams();
  const [data, setData] = useState<EnrollmentModulesData | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const fetchModules = async () => {
    if (!enrollmentId) return;
    try {
      const res = await fetch(`http://localhost:${PORT}/api/learnerDashboard/course/${enrollmentId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch modules');
      }
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching modules:', error);
      message.error('Failed to load modules.');
    }
  };

  useEffect(() => {
    fetchModules();
  }, [enrollmentId]);

  const openModuleModal = (module: Module) => {
    setSelectedModule(module);
    setModalVisible(true);
  };

  const closeModuleModal = () => {
    setModalVisible(false);
    setSelectedModule(null);
  };

  const handleMarkCompleted = async (module_id: number) => {
    try {
      const res = await fetch(
        `http://localhost:${PORT}/api/learnerDashboard/course/${enrollmentId}/module/${module_id}/complete`,
        {
          method: 'PUT',
        }
      );
      if (!res.ok) {
        throw new Error('Failed to update module progress');
      }
      message.success('Module marked as completed');
      closeModuleModal();
      fetchModules(); // Refresh modules data after update
    } catch (error) {
      console.error('Error updating module progress:', error);
      message.error('Failed to update module progress.');
    }
  };

  if (!data) {
    return null; // Optionally, return a loading indicator here
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>{data.course_name || 'Module Details'}</Title>
        <Text strong>Overall Progress: </Text>
        <Progress percent={Number(data.completion_percentage)} style={{ width: 300 }} />
        <List
          dataSource={data.modules}
          renderItem={(module) => (
            <List.Item>
              <Card
                style={{
                  width: '100%',
                  backgroundColor: module.status === 'completed' ? '#2f8a2b' : '#fff',
                }}
                onClick={() => openModuleModal(module)}
                hoverable
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileDoneOutlined style={{ fontSize: 24, marginRight: 8, color: module.status === 'completed' ? '#fff' : undefined }} />
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: module.status === 'completed' ? '#fff' : '#000' }}>
                      {module.module_name}
                    </div>
                    <div style={{ color: module.status === 'completed' ? '#fff' : '#000' }}>
                      Status: {module.status}, Progress: {module.progress}%
                    </div>
                  </div>
                </div>
              </Card>

            </List.Item>
          )}
        />

        <Modal
          visible={modalVisible}
          onCancel={closeModuleModal}
          footer={null}
          title={selectedModule?.module_name}
        >
          <Paragraph>
            {selectedModule?.module_description || 'No description available for this module.'}
          </Paragraph>
          <Text>
            Status: {selectedModule?.status}, Progress: {selectedModule?.progress}%
          </Text>
          <div style={{ marginTop: 16 }}>
            {selectedModule && selectedModule.status !== 'completed' && (
              <Button type="primary" onClick={() => handleMarkCompleted(selectedModule.module_id)}>
                Mark as Completed
              </Button>
            )}
            <Button style={{ marginLeft: 8 }} onClick={closeModuleModal}>
              Close
            </Button>
          </div>
        </Modal>
      </Content>
    </Layout>
  );
};

export default CourseModuleDetail;
