import React, { useEffect, useState } from 'react';
import { Layout, Tabs, Card, Table, Button, Modal, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getUserFromSession } from '../utils/sessionUtils';
import ProviderUpdate from '../component/form/providerUpdateForm'; // adjust the path if necessary

interface Course {
    course_id: number;
    name: string;
    description: string;
    price: number;
    max_capacity: number;
    category: string;
    source: string;
    external_reference_number?: string;
    training_provider_alias?: string;
    total_training_hours?: number;
    total_cost?: number;
    tile_image_url?: string;
}

interface Enrollment {
    enrollment_id: number;
    course_id: number;
    completion_percentage: string;
    is_kicked: number;
    enrolled_at: string;
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    cover_image_url?: string;
    profile_image_url?: string;
    occupation?: string;
    company_name?: string;
    course_name: string;
}

const { Header, Content } = Layout;

const ProviderDashboard: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const navigate = useNavigate();

    // Retrieve provider id from session
    const providerId = getUserFromSession().id;
    console.log('Provider ID:', providerId);

    useEffect(() => {
        fetchCourses();
        fetchEnrollments();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            console.log("Fetching courses for provider id:", providerId);
            const response = await fetch(`http://localhost:5000/api/providerCourses?id=${providerId}`);
            const data = await response.json();
            if (response.ok) {
                setCourses(data.data);
            } else {
                message.error(data.error || 'Failed to fetch courses');
            }
        } catch (error) {
            message.error('Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchEnrollments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/providerEnrollments?creator_id=${providerId}`);
            const data = await response.json();
            console.log("Enrollments data:", data);
            if (response.ok) {
                setEnrollments(data.data);
            } else {
                message.error(data.error || 'Failed to fetch enrollments');
            }
        } catch (error) {
            message.error('Failed to fetch enrollments');
        }
    };

    // When update button is clicked, select a course and open the modal
    const handleSelectCourse = (course: Course) => {
        setSelectedCourse(course);
        setModalVisible(true);
    };

    // Handle course update submission from modal
    const onFinish = async (values: any) => {
        if (!selectedCourse) return;
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/updateCourse/${selectedCourse.course_id}?creator_id=${providerId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                }
            );
            const result = await response.json();
            if (response.ok) {
                message.success('Course updated successfully!');
                setModalVisible(false);
                setSelectedCourse(null);
                fetchCourses();
            } else {
                message.error(result.error || 'Failed to update course');
            }
        } catch (error) {
            console.error('Error updating course:', error);
            message.error('Failed to update course');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = (courseId: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this course?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/deleteCourse/${courseId}?creator_id=${providerId}`, {
                        method: 'DELETE',
                    });
                    const data = await response.json();
                    if (response.ok) {
                        message.success('Course deleted successfully');
                        setCourses(prev => prev.filter(course => course.course_id !== courseId));
                    } else {
                        message.error(data.error || 'Failed to delete course');
                    }
                } catch (error) {
                    message.error('Failed to delete course');
                }
            },
        });
    };
    //shawn added
    const handleRemoveLearner = (courseId: number, enrollmentId: number) => {
        Modal.confirm({
            title: 'Are you sure you want to remove this learner?',
            content: 'This action will unenroll the learner from the course.',
            okText: 'Remove',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const response = await fetch(
                        `http://localhost:5000/api/courses/${courseId}/enrollments/${enrollmentId}`, 
                        {
                            method: 'DELETE',
                        }
                    );
                    const data = await response.json();
                    if (response.ok) {
                        message.success('Learner removed successfully');
                        setEnrollments(prev => prev.filter(enrollment => 
                            enrollment.enrollment_id !== enrollmentId
                        ));
                    } else {
                        message.error(data.error || 'Failed to remove learner');
                    }
                } catch (error) {
                    message.error('Failed to remove learner');
                }
            },
        });
    };
    

    const columnsCourses = [
        {
            title: 'Course ID',
            dataIndex: 'course_id',
            key: 'course_id',
        },
        {
            title: 'Course Title',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Course) => (
                <a onClick={() => navigate(`/course-detail/${record.course_id}`)}>{text}</a>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Course) => (
                <>
                    <Button
                        type="primary"
                        style={{ marginRight: 8 }}
                        onClick={() => handleSelectCourse(record)}
                    >
                        Update
                    </Button>
                    <Button danger onClick={() => handleDeleteCourse(record.course_id)}>
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    const columnsEnrollments = [
        {
            title: 'Enrollment ID',
            dataIndex: 'enrollment_id',
            key: 'enrollment_id',
        },
        {
            title: 'Learner ID',
            dataIndex: 'user_id',
            key: 'user_id',
        },
        {
            title: 'Learner Name',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Course',
            dataIndex: 'course_name',
            key: 'course_name',
        },
        {
            title: 'Status',
            dataIndex: 'is_kicked',
            key: 'is_kicked',
            render: (isKicked: number) => (isKicked ? 'kicked' : 'enrolled'),
        },
        {
            title: 'Enrollment Date',
            dataIndex: 'enrolled_at',
            key: 'enrolled_at',
        },
        //shawn added
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Enrollment) => (
                <Button danger onClick={() => handleRemoveLearner(record.course_id, record.enrollment_id)}>
                    Remove Learner
                </Button>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ background: '#fff', padding: '0 24px' }}>
                <h1 style={{ margin: 0 }}>Provider Management Dashboard</h1>
            </Header>
            <Content style={{ margin: '24px' }}>
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="My Courses" key="1">
                        <Card title="Course List" bordered={false} style={{ padding: '24px' }}>
                            <Table rowKey="course_id" dataSource={courses} columns={columnsCourses} loading={loading} />
                            <div style={{ marginTop: '16px', textAlign: 'right' }}>
                                <Button type="primary" onClick={() => navigate('/createcourse')}>
                                    New Course
                                </Button>
                            </div>
                        </Card>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Enrollments" key="2">
                        <Card title="Learner Enrollments" bordered={false} style={{ padding: '24px' }}>
                            <Table rowKey="enrollment_id" dataSource={enrollments} columns={columnsEnrollments} />
                        </Card>
                    </Tabs.TabPane>
                </Tabs>
            </Content>
            <ProviderUpdate
                open={modalVisible}
                loading={loading}
                initialValues={selectedCourse || {}}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedCourse(null);
                }}
                onFinish={onFinish}
            />
        </Layout>
    );
};

export default ProviderDashboard;
