import React, { useEffect, useState } from 'react';
import {
    Layout,
    Form,
    Button,
    message,
    Row,
    Col,
    Card,
    Skeleton,
    Descriptions,
    Table,
    Modal,
    Input,
    InputNumber
} from 'antd';
import { useParams } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import ProviderUpdate from '../component/form/providerUpdateForm'; // Adjust the path as needed
import ModuleEditForm from '../component/form/moduleEditForm'; // Adjust the path as needed

interface Course {
    course_id: number;
    name: string;
    description: string;
    price: number;
    max_capacity: number;
    category: string;
    source: 'internal' | 'myskillsfuture';
    external_reference_number?: string;
    training_provider_alias?: string;
    total_training_hours?: number;
    total_cost?: number;
    tile_image_url?: string;
    enrollmentCount?: number;
}

interface CourseModule {
    module_id: number;
    module_name: string;
    module_description: string;
    module_order: number;
    created_at: string;
}

interface CourseReview {
    review_id: number;
    user_id: number;
    username: string;
    rating: number;
    comment: string;
    created_at: string;
}

const { Header, Content } = Layout;

const CourseDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);

    // States for modules and reviews
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [addModuleModalOpen, setAddModuleModalOpen] = useState<boolean>(false);
    const [moduleForm] = Form.useForm();
    const [editModuleModalOpen, setEditModuleModalOpen] = useState<boolean>(false);
    const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);

    useEffect(() => {
        if (id) {
            const courseId = parseInt(id);
            fetchCourseDetail(courseId);
            fetchModules(courseId);
            fetchReviews(courseId);
        }
    }, [id]);

    // GET fetch: Retrieve course details
    const fetchCourseDetail = async (courseId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/getCourse/${courseId}`, { method: 'GET' });
            const data = await response.json();
            if (response.ok) {
                setCourse(data.courseData);
                form.setFieldsValue(data.courseData);
            } else {
                message.error(data.error || 'Failed to fetch course details');
            }
        } catch (error) {
            console.error('Error fetching course details:', error);
            message.error('Failed to fetch course details');
        } finally {
            setLoading(false);
        }
    };

    // GET fetch: Retrieve modules for the course
    const fetchModules = async (courseId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/courseModules?course_id=${courseId}`, {
                method: 'GET'
            });
            const data = await response.json();
            if (response.ok) {
                setModules(data.data);
            } else {
                message.error(data.error || 'Failed to fetch course modules');
            }
        } catch (error) {
            console.error('Error fetching course modules:', error);
            message.error('Failed to fetch course modules');
        }
    };

    // GET fetch: Retrieve reviews for the course
    const fetchReviews = async (courseId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/courses/${courseId}/reviews`, {
                method: 'GET'
            });
            const data = await response.json();
            if (response.ok) {
                // If your API returns an array of reviews directly
                setReviews(data);
            } else {
                message.error(data.error || 'Failed to fetch course reviews');
            }
        } catch (error) {
            console.error('Error fetching course reviews:', error);
            message.error('Failed to fetch course reviews');
        }
    };

    // POST fetch: Handler for adding a new course module
    const handleAddModuleSubmit = async (values: any) => {
        if (!course) return;
        setLoading(true);
        try {
            const payload = { ...values, course_id: course.course_id };
            const response = await fetch(`http://localhost:5000/api/courseModule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok) {
                message.success('Module added successfully!');
                setAddModuleModalOpen(false);
                moduleForm.resetFields();
                fetchModules(course.course_id);
            } else {
                message.error(result.error || 'Failed to add module');
            }
        } catch (error) {
            console.error('Error adding module:', error);
            message.error('Failed to add module');
        } finally {
            setLoading(false);
        }
    };

    // PUT fetch: Handler for editing a course module using ModuleEditForm component
    const handleEditModuleSubmit = async (values: any) => {
        if (!selectedModule || !course) return;
        setLoading(true);
        try {
            const payload = { ...values, course_id: course.course_id };
            const response = await fetch(`http://localhost:5000/api/courseModule/${selectedModule.module_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok) {
                message.success('Module updated successfully!');
                setEditModuleModalOpen(false);
                setSelectedModule(null);
                fetchModules(course.course_id);
            } else {
                message.error(result.error || 'Failed to update module');
            }
        } catch (error) {
            console.error('Error updating module:', error);
            message.error('Failed to update module');
        } finally {
            setLoading(false);
        }
    };

    // PUT fetch: Handler for course update (using ProviderUpdate component)
    const handleUpdateSubmit = async (values: any) => {
        if (!course) return;
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:5000/api/updateCourse/${course.course_id}?creator_id=${course.course_id}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                }
            );
            const result = await response.json();
            if (response.ok) {
                message.success('Course updated successfully!');
                setUpdateModalOpen(false);
                fetchCourseDetail(course.course_id);
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

    // DELETE fetch: Handler for deleting a course
    const handleDeleteCourse = (courseId: number) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this course?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/deleteCourse/${courseId}?creator_id=${course?.course_id}`, {
                        method: 'DELETE',
                    });
                    const data = await response.json();
                    if (response.ok) {
                        message.success('Course deleted successfully');
                        // Possibly navigate away or reload
                    } else {
                        message.error(data.error || 'Failed to delete course');
                    }
                } catch (error) {
                    console.error('Error deleting course:', error);
                    message.error('Failed to delete course');
                }
            },
        });
    };

    // Columns for modules table, including Edit Module action
    const columnsModules = [
        { title: 'Module ID', dataIndex: 'module_id', key: 'module_id' },
        { title: 'Module Name', dataIndex: 'module_name', key: 'module_name' },
        { title: 'Order', dataIndex: 'module_order', key: 'module_order' },
        { title: 'Description', dataIndex: 'module_description', key: 'module_description' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: CourseModule) => (
                <Button
                    type="primary"
                    onClick={() => {
                        setSelectedModule(record);
                        setEditModuleModalOpen(true);
                        moduleForm.setFieldsValue(record);
                    }}
                >
                    Edit Module
                </Button>
            ),
        },
    ];

    // Columns for reviews table
    const columnsReviews = [
        { title: 'Review ID', dataIndex: 'review_id', key: 'review_id' },
        { title: 'Learner', dataIndex: 'username', key: 'username' },
        { title: 'Rating', dataIndex: 'rating', key: 'rating' },
        { title: 'Comment', dataIndex: 'comment', key: 'comment' },
        { title: 'Date', dataIndex: 'created_at', key: 'created_at' },
    ];

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Header style={{ background: '#fff', padding: '0 24px' }}>
                <h1 style={{ margin: 0 }}>Course Details</h1>
            </Header>
            <Content style={{ margin: '24px' }}>
                {loading ? (
                    <Skeleton active />
                ) : course ? (
                    <>
                        <div
                            style={{
                                backgroundImage: `url(${course.tile_image_url || 'https://via.placeholder.com/1200x300'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                padding: '80px 24px',
                                marginBottom: '24px',
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            }}
                        >
                            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>{course.name}</h2>
                            <p style={{ fontSize: '1.2rem', marginTop: '8px' }}>{course.category}</p>
                        </div>
                        <Row gutter={[24, 24]}>
                            {/* Course Overview */}
                            <Col xs={24} md={16}>
                                <Card bordered={false}>
                                    <h3>Description</h3>
                                    <p>{course.description}</p>
                                    <h3 style={{ marginTop: '24px' }}>Course Details</h3>
                                    <Descriptions column={2} bordered size="small">
                                        <Descriptions.Item label="Price">${course.price}</Descriptions.Item>
                                        <Descriptions.Item label="Max Capacity">{course.max_capacity}</Descriptions.Item>
                                        <Descriptions.Item label="Total Training Hours">
                                            {course.total_training_hours}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Total Cost">${course.total_cost}</Descriptions.Item>
                                        <Descriptions.Item label="Source">{course.source}</Descriptions.Item>
                                        {course.external_reference_number && (
                                            <Descriptions.Item label="External Ref No">
                                                {course.external_reference_number}
                                            </Descriptions.Item>
                                        )}
                                        {course.training_provider_alias && (
                                            <Descriptions.Item label="Provider Alias">
                                                {course.training_provider_alias}
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                    <div style={{ marginTop: '24px', textAlign: 'right' }}>
                                        <Button type="primary" onClick={() => setUpdateModalOpen(true)}>
                                            Update Course
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                            {/* Enrollment Count */}
                            <Col xs={24} md={8}>
                                <Card bordered={false} style={{ textAlign: 'center', padding: '24px' }}>
                                    <UserOutlined style={{ fontSize: '3rem', color: '#1890ff' }} />
                                    <h3 style={{ marginTop: '16px' }}>Enrolled Students</h3>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                                        {course.enrollmentCount}
                                    </p>
                                </Card>
                            </Col>
                        </Row>

                        {/* Modules */}
                        <Card title="Course Modules" bordered={false} style={{ marginTop: '24px', padding: '24px' }}>
                            <Button
                                type="primary"
                                onClick={() => setAddModuleModalOpen(true)}
                                style={{ marginBottom: '16px' }}
                            >
                                Add Module
                            </Button>
                            <Table
                                rowKey="module_id"
                                dataSource={modules}
                                columns={columnsModules}
                                pagination={false}
                            />
                        </Card>

                        {/* Reviews */}
                        <Card title="Course Reviews" bordered={false} style={{ marginTop: '24px', padding: '24px' }}>
                            <Table
                                rowKey="review_id"
                                dataSource={reviews}
                                columns={columnsReviews}
                                pagination={false}
                            />
                        </Card>
                    </>
                ) : (
                    <div>No course data found.</div>
                )}
            </Content>

            {/* ProviderUpdate Modal */}
            <ProviderUpdate
                open={updateModalOpen}
                loading={loading}
                initialValues={course || {}}
                onCancel={() => {
                    setUpdateModalOpen(false);
                }}
                onFinish={handleUpdateSubmit}
            />

            {/* Add Module Modal */}
            <Modal
                open={addModuleModalOpen}
                title="Add Course Module"
                onCancel={() => {
                    setAddModuleModalOpen(false);
                    moduleForm.resetFields();
                }}
                footer={null}
            >
                <Form form={moduleForm} layout="vertical" onFinish={handleAddModuleSubmit}>
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
                            Add Module
                        </Button>
                        <Button
                            style={{ marginLeft: '8px' }}
                            onClick={() => {
                                setAddModuleModalOpen(false);
                                moduleForm.resetFields();
                            }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Module Modal */}
            <ModuleEditForm
                open={editModuleModalOpen}
                loading={loading}
                initialValues={selectedModule || {}}
                onCancel={() => {
                    setEditModuleModalOpen(false);
                    setSelectedModule(null);
                }}
                onFinish={handleEditModuleSubmit}
            />
        </Layout>
    );
};

export default CourseDetailPage;
