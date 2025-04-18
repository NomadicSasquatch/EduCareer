import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Row, Col, Input, Card, Typography, List, Select, Spin, Button, Tag, Tabs, Empty, Rate, Modal, message } from 'antd';
import { ShoppingCartOutlined, StarOutlined, CheckCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';
import { showErrorMessage } from '../utils/messageUtils';
import { useNavigate } from 'react-router-dom';
import PORT from '../hooks/usePort';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

export type Course = {
  courseId?: number;
  externalReferenceNumber?: string;
  title: string;
  description?: string;
  duration?: string;
  category?: string;
  provider?: string;
  date?: string;
  price?: number;
  objective?: string;
  totalTrainingHours?: number;
  tileImageURL?: string;
  detailImageURL?: string;
  url?: string;
  modeOfTrainings?: { code: string; description: string }[];
  source?: string; // "internal" or "myskillsfuture"
  reviews?: Review[];
};

type Review = {
  reviewId: number;
  userId: number;
  userName: string;
  courseId?: number;
  externalReferenceNumber?: string;
  rating: number;
  comment: string;
  date: string;
};

const SearchCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [editReviewModalVisible, setEditReviewModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(0);
  const [editReviewComment, setEditReviewComment] = useState('');

  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [selectedSource, setSelectedSource] = useState<string | undefined>(undefined);

  const [inputKeyword, setInputKeyword] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  const [page, setPage] = useState<number>(1);
  const [hoverLoadMore, setHoverLoadMore] = useState<boolean>(false);

  const fetchCombinedCourses = async (pageToLoad: number) => {
    setIsLoading(true);
    try {
      const internalCoursesPromise =
        pageToLoad === 1
          ? fetch(`http://localhost:${PORT}/api/getAllCourses?keyword=${encodeURIComponent(keyword)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          }).then(res => res.json())
          : Promise.resolve({ data: [] });

      // External API call with 404 handling
      const externalCoursesPromise = fetch(
        `http://localhost:${PORT}/api/skillsfuture/courses?keyword=${encodeURIComponent(keyword)}&page=${pageToLoad}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        }
      ).then(async (res) => {
        if (res.status === 404) {
          return { data: { courses: [] } };
        }
        if (!res.ok) {
          throw new Error(`External API error: ${res.status}`);
        }
        return res.json();
      });

      const [internalResult, externalResult] = await Promise.allSettled([
        internalCoursesPromise,
        externalCoursesPromise
      ]);

      const internalData = internalResult.status === 'fulfilled' ? internalResult.value : { data: [] };
      const externalData = externalResult.status === 'fulfilled' ? externalResult.value : { data: { courses: [] } };

      const internalCourses: Course[] = (internalData.data || []).map((course: any) => ({
        courseId: course.course_id,
        externalReferenceNumber: course.external_reference_number || `internal-${course.course_id}`,
        title: course.name,
        description: course.description,
        category: course.category || '',
        provider: course.training_provider_alias || '',
        date: course.created_at ? course.created_at.split('T')[0] : '',
        objective: '',
        price: course.total_cost || 0,
        totalTrainingHours: course.total_training_hours || 0,
        duration: `${course.total_training_hours || 0} hours`,
        tileImageURL: course.tile_image_url || '',
        detailImageURL: '',
        url: course.url || '',
        modeOfTrainings: [],
        source: 'internal',
        reviews: []
      }));

      const externalCourses: Course[] = (externalData.data.courses || []).map((course: any) => ({
        courseId: 0,
        externalReferenceNumber: course.externalReferenceNumber,
        title: course.title,
        description: course.content,
        category: course.category || '',
        provider: course.trainingProviderAlias || '',
        date: course.meta?.createDate ? course.meta.createDate.split('T')[0] : '',
        objective: course.objective || '',
        price: course.totalCostOfTrainingPerTrainee || 0,
        totalTrainingHours: course.totalTrainingDurationHour || 0,
        duration: `${course.totalTrainingDurationHour || 0} hours`,
        tileImageURL: course.tileImageURL
          ? (course.tileImageURL.startsWith('/') ? `https://www.myskillsfuture.gov.sg${course.tileImageURL}` : course.tileImageURL)
          : '',
        detailImageURL: course.detailImageURL
          ? (course.detailImageURL.startsWith('/') ? `https://www.myskillsfuture.gov.sg${course.detailImageURL}` : course.detailImageURL)
          : '',
        url: course.url || '',
        modeOfTrainings: course.modeOfTrainings || [],
        source: course.source || 'myskillsfuture',
        reviews: []
      }));

      const combinedCourses = [...internalCourses, ...externalCourses];

      for (const course of combinedCourses) {
        try {
          let reviewsUrl;
          if (course.source === 'internal' && course.courseId) {
            reviewsUrl = `http://localhost:5000/api/courses/${course.courseId}/reviews`;
          } else if (course.externalReferenceNumber) {
            reviewsUrl = `http://localhost:5000/api/courses/reviews?externalReferenceNumber=${encodeURIComponent(course.externalReferenceNumber)}`;
          } else {
            continue;
          }
      
          const reviewsResponse = await fetch(reviewsUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            course.reviews = reviewsData.map((review: any) => ({
              reviewId: review.review_id,
              userId: review.user_id,
              userName: review.user_name || 'Anonymous User',
              courseId: review.course_id,
              externalReferenceNumber: review.external_reference_number,
              rating: review.rating,
              comment: review.comment,
              date: review.created_at ? review.created_at.split('T')[0] : moment().format('YYYY-MM-DD')
            }));
          }
        } catch (error) {
          console.error('Error fetching reviews for course:', course.title, error);
        }
      }

      if (pageToLoad === 1) {
        setCoursesData(combinedCourses);
      } else {
        setCoursesData(prev => {
          const newCourses = combinedCourses.filter(
            course => !prev.some(c => c.externalReferenceNumber === course.externalReferenceNumber)
          );
          return [...prev, ...newCourses];
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      showErrorMessage('Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    setPage(1);
    fetchCombinedCourses(1);
  }, [keyword]);

  const allCourses = useMemo(() => coursesData, [coursesData]);
  const categories = useMemo(
    () => Array.from(new Set(allCourses.map(course => course.category).filter(Boolean))),
    [allCourses]
  );
  const providers = useMemo(
    () => Array.from(new Set(allCourses.map(course => course.provider).filter(Boolean))),
    [allCourses]
  );

  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      if (selectedSource) {
        return course.source === selectedSource &&
          course.title.toLowerCase().includes(filterText.toLowerCase()) &&
          (selectedCategory ? course.category === selectedCategory : true) &&
          (selectedProvider ? course.provider === selectedProvider : true);
      } else {
        if (course.source === 'internal') return true;
        return course.title.toLowerCase().includes(filterText.toLowerCase()) &&
          (selectedCategory ? course.category === selectedCategory : true) &&
          (selectedProvider ? course.provider === selectedProvider : true);
      }
    });
  }, [allCourses, filterText, selectedCategory, selectedProvider, selectedSource]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCombinedCourses(nextPage);
  };

  const handleCheckCourse = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      showErrorMessage("No course URL available");
    }
  };

  const handleEnroll = async (course: Course) => {
    if (course.source === 'myskillsfuture') {
      const externalUrl = course.url ||
        `https://www.myskillsfuture.gov.sg/content/portal/en/training-exchange/course-directory/course-detail.html?courseReferenceNumber=${course.externalReferenceNumber}`;
      window.open(externalUrl, '_blank');
      return;
    }

    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      Modal.confirm({
        title: 'Login Required',
        content: 'You need to be logged in to enroll in courses. Would you like to login now?',
        okText: 'Login',
        cancelText: 'Cancel',
        onOk: () => {
          navigate('/login');
        }
      });
      return;
    }

    const user = JSON.parse(userJson);

    if (!course.courseId) {
      message.error('Invalid course information');
      return;
    }

    try {
      const response = await fetch(`http://localhost:${PORT}/api/courses/${course.courseId}/enrollment-check?userId=${user.id}`, {

        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to verify enrollment status');
      }

      const data = await response.json();

      if (data.isEnrolled === true) {
        message.info('You are already enrolled in this course');
        return;
      }

      localStorage.setItem('selectedCourse', JSON.stringify(course));
      navigate('/checkout');

    } catch (error) {
      console.error('Error checking enrollment status:', error);
      message.error('Unable to verify enrollment status. Please try again later.');
    }
  };
  
  const hasUserReviewed = (course: Course) => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return false;
    
    const user = JSON.parse(userJson);
    return course.reviews?.some(review => review.userId === user.id);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditReviewRating(review.rating);
    setEditReviewComment(review.comment);
    setEditReviewModalVisible(true);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const response = await fetch(`http://localhost:5000/api/courses/reviews/${editingReview.reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: editReviewRating,
          comment: editReviewComment
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      const updatedCourses = coursesData.map(course => {
        if (course.externalReferenceNumber === selectedCourse?.externalReferenceNumber) {
          const updatedReviews = course.reviews?.map(review => {
            if (review.reviewId === editingReview.reviewId) {
              return {
                ...review,
                rating: editReviewRating,
                comment: editReviewComment
              };
            }
            return review;
          });
          return { ...course, reviews: updatedReviews };
        }
        return course;
      });

      setCoursesData(updatedCourses);
      
      if (selectedCourse) {
        const updatedCourse = updatedCourses.find(
          c => c.externalReferenceNumber === selectedCourse.externalReferenceNumber
        );
        if (updatedCourse) {
          setSelectedCourse(updatedCourse);
        }
      }

      setEditReviewModalVisible(false);
      message.success('Review updated successfully');
    } catch (error) {
      console.error('Error updating review:', error);
      message.error('Failed to update review. Please try again later.');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    Modal.confirm({
      title: 'Delete Review',
      content: 'Are you sure you want to delete this review? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/courses/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to delete review');
          }

          const updatedCourses = coursesData.map(course => {
            if (course.externalReferenceNumber === selectedCourse?.externalReferenceNumber) {
              const updatedReviews = course.reviews?.filter(review => review.reviewId !== reviewId);
              return { ...course, reviews: updatedReviews };
            }
            return course;
          });

          setCoursesData(updatedCourses);
          
          if (selectedCourse) {
            const updatedCourse = updatedCourses.find(
              c => c.externalReferenceNumber === selectedCourse.externalReferenceNumber
            );
            if (updatedCourse) {
              setSelectedCourse(updatedCourse);
            }
          }

          message.success('Review deleted successfully');
        } catch (error) {
          console.error('Error deleting review:', error);
          message.error('Failed to delete review. Please try again later.');
        }
      }
    });
  };

  const handleSubmitReview = async () => {
    if (!selectedCourse) return;

    if (userRating === 0) {
      message.error('Please provide a rating');
      return;
    }

    const userJson = sessionStorage.getItem('user');
    if (!userJson) {
      Modal.confirm({
        title: 'Login Required',
        content: 'You need to be logged in to write a review. Would you like to login now?',
        okText: 'Login',
        cancelText: 'Cancel',
        onOk: () => {
          navigate('/login');
        }
      });
      return;
    }
    
    const user = JSON.parse(userJson);
    
    if (hasUserReviewed(selectedCourse)) {
      message.error('You have already reviewed this course. You can edit your existing review instead.');
      return;
    }
    
    const newReview: Review = {
      reviewId: 0,
      userId: user.id,
      userName: user.username || 'User',
      courseId: selectedCourse.courseId,
      externalReferenceNumber: selectedCourse.externalReferenceNumber,
      rating: userRating,
      comment: reviewComment,
      date: moment().format('YYYY-MM-DD')
    };

    try {
      const endpoint = selectedCourse.courseId
        ? `http://localhost:${PORT}/api/courses/${selectedCourse.courseId}/reviews`
        : `http://localhost:${PORT}/api/courses/reviews`;
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: newReview.userId,
          rating: newReview.rating,
          comment: newReview.comment,
          externalReferenceNumber: selectedCourse.externalReferenceNumber
        }),
        credentials: 'include'
      });
  
      if (!response.ok) throw new Error('Failed to submit review');
  
      const result = await response.json();
      newReview.reviewId = result.review_id ?? result.reviewId;
      const updatedCourses = coursesData.map(course =>
        course.externalReferenceNumber === selectedCourse.externalReferenceNumber
          ? { ...course, reviews: [...(course.reviews || []), newReview] }
          : course
      );
      setCoursesData(updatedCourses);
  
      const updatedCourse = updatedCourses.find(
        c => c.externalReferenceNumber === selectedCourse.externalReferenceNumber
      );
      if (updatedCourse) setSelectedCourse(updatedCourse);
  
      setReviewModalVisible(false);
      setUserRating(0);
      setReviewComment('');
      message.success('Review submitted successfully');
    } catch (err) {
      console.error('Error submitting review:', err);
      message.error('Failed to submit review. Please try again later.');
    }
  };

  const getAverageRating = (course: Course) => {
    if (!course.reviews || course.reviews.length === 0) return 0;

    const sum = course.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / course.reviews.length;
  };

  // Function to sort reviews so user's review is first
  const sortReviews = (reviews: Review[]) => {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return reviews;
    
    const user = JSON.parse(userJson);
    return [...reviews].sort((a, b) => {
      if (a.userId === user.id) return -1;
      if (b.userId === user.id) return 1;
      return 0;
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5', marginLeft: 'auto', marginRight: 'auto' }}>
      <Content style={{ padding: '24px' }}>
        <Row gutter={[16, 16]} justify="center" align="top">
          <Col xs={20} lg={5} style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            <Card title="Filter Courses" bordered={false}>
              <Search
                placeholder="Search by keyword"
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                onSearch={(value) => setKeyword(value)}
                style={{ marginBottom: 16 }}
              />
              <Select
                placeholder="Filter by Source"
                style={{ width: '100%', marginBottom: 16 }}
                allowClear
                value={selectedSource}
                onChange={(value) => setSelectedSource(value)}
              >
                <Option value="internal">Internal</Option>
                <Option value="myskillsfuture">SkillsFuture SG</Option>
              </Select>
              <Select
                placeholder="Filter by Category"
                style={{ width: '100%', marginBottom: 16 }}
                allowClear
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
              >
                {categories.map((cat) => (
                  <Option key={cat} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Filter by Provider"
                style={{ width: '100%', marginBottom: 16 }}
                allowClear
                value={selectedProvider}
                onChange={(value) => setSelectedProvider(value)}
              >
                {providers.map((prov) => (
                  <Option key={prov} value={prov}>
                    {prov}
                  </Option>
                ))}
              </Select>
            </Card>
            {isLoading && page === 1 ? (
              <Spin style={{ display: 'block', marginTop: 20 }} />
            ) : (
              <>
                <List
                  itemLayout="vertical"
                  dataSource={filteredCourses}
                  renderItem={(course) => (
                    <List.Item key={course.externalReferenceNumber}>
                      <Card
                        hoverable
                        onClick={() => setSelectedCourse(course)}
                        style={{
                          marginBottom: 12,
                          border: selectedCourse?.externalReferenceNumber === course.externalReferenceNumber ? '2px solid #1890ff' : undefined,
                        }}
                      >
                        {course.tileImageURL && (
                          <img
                            src={course.tileImageURL}
                            alt={course.title}
                            style={{
                              width: '80%',
                              marginBottom: '8px',
                              display: 'block',
                              marginLeft: 'auto',
                              marginRight: 'auto'
                            }}
                          />
                        )}
                        <Title level={5}>{course.title}</Title>
                        <Paragraph ellipsis={{ rows: 2 }}>{course.description}</Paragraph>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text type="secondary">{course.provider}</Text>
                          <Text strong>
                            {(Number(course.price) === 0 || !course.price)
                              ? 'Free'
                              : `$${course.price}`}
                          </Text>
                        </div>
                        {course.reviews && course.reviews.length > 0 && (
                          <div>
                            <Rate disabled value={getAverageRating(course)} />
                            <Text type="secondary"> ({course.reviews?.length || 0} reviews)</Text>
                          </div>
                        )}
                        {course.source && (
                          <Tag color={course.source === 'internal' ? 'green' : 'volcano'} style={{ marginBottom: 8, marginTop: 8 }}>
                            {course.source === 'internal' ? 'Internal' : 'SkillsFuture SG'}
                          </Tag>
                        )}
                        {course.modeOfTrainings && course.modeOfTrainings.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            {course.modeOfTrainings.map((mode, idx) => (
                              <Tag key={idx} color="geekblue">
                                {mode.description}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </Card>
                    </List.Item>
                  )}
                />
                <div
                  onClick={handleLoadMore}
                  onMouseEnter={() => setHoverLoadMore(true)}
                  onMouseLeave={() => setHoverLoadMore(false)}
                  style={{
                    textAlign: 'center',
                    padding: '10px 0',
                    color: hoverLoadMore ? 'lightblue' : 'grey',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </div>
              </>
            )}
          </Col>

          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ minHeight: '80vh', padding: '24px' }}>
              {selectedCourse ? (
                <>
                  <Title level={2}>{selectedCourse.title}</Title>

                  <Title level={4}>
                    {(Number(selectedCourse.price) === 0 || !selectedCourse.price)
                      ? 'Free'
                      : `$${selectedCourse.price}`}
                  </Title>

                  {selectedCourse.detailImageURL && (
                    <img
                      src={selectedCourse.detailImageURL}
                      alt={selectedCourse.title}
                      style={{ width: '100%', marginBottom: '16px' }}
                    />
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Rate disabled value={getAverageRating(selectedCourse)} />
                      <Text style={{ marginLeft: '8px' }}>
                        ({selectedCourse.reviews?.length || 0} reviews)
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      icon={selectedCourse.source === 'myskillsfuture' ? <CheckCircleOutlined /> : <ShoppingCartOutlined />}
                      onClick={() => handleEnroll(selectedCourse)}
                    >
                      {selectedCourse.source === 'myskillsfuture'
                        ? 'View on SkillsFuture'
                        : ((Number(selectedCourse.price) === 0 || !selectedCourse.price)
                          ? 'Enroll For Free'
                          : 'Enroll Now')}
                    </Button>
                  </div>

                  <Tabs defaultActiveKey="1">
                    <TabPane tab="Details" key="1">
                      <Paragraph><strong>Provider:</strong> {selectedCourse.provider}</Paragraph>
                      <Paragraph><strong>Cost:</strong> {(Number(selectedCourse.price) === 0 || !selectedCourse.price)
                        ? 'Free'
                        : `$${selectedCourse.price}`}</Paragraph>
                      <Paragraph><strong>Duration:</strong> {selectedCourse.duration || `${selectedCourse.totalTrainingHours} hours`}</Paragraph>
                      {selectedCourse.modeOfTrainings && selectedCourse.modeOfTrainings.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <Title level={5}>Mode of Training</Title>
                          {selectedCourse.modeOfTrainings.map((mode, idx) => (
                            <Tag key={idx} color="geekblue">
                              {mode.description}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab="Description" key="2">
                      <Paragraph>{selectedCourse.description || "No description provided."}</Paragraph>
                    </TabPane>
                    <TabPane tab="Objective" key="3">
                      <Paragraph>{selectedCourse.objective || "No objective provided."}</Paragraph>
                    </TabPane>
                    <TabPane tab="Reviews" key="4">
                      {/* Reviews section - only show Write Review button if user hasn't reviewed yet */}
                      {!hasUserReviewed(selectedCourse) && (
                        <Button
                          style={{ marginBottom: '16px' }}
                          icon={<StarOutlined />}
                          onClick={() => setReviewModalVisible(true)}
                        >
                          Write a Review
                        </Button>
                      )}

                      {selectedCourse.reviews && selectedCourse.reviews.length > 0 ? (
                        <List
                          itemLayout="vertical"
                          dataSource={sortReviews(selectedCourse.reviews)}
                          renderItem={(review) => {
                            // Check if this review belongs to the current user
                            const userJson = sessionStorage.getItem('user');
                            const isUserReview = userJson ? JSON.parse(userJson).id === review.userId : false;

                            return (
                              <List.Item 
                                actions={isUserReview ? [
                                  <Button 
                                    icon={<EditOutlined />} 
                                    size="small" 
                                    onClick={() => handleEditReview(review)}
                                  >
                                    Edit
                                  </Button>,
                                  <Button 
                                    icon={<DeleteOutlined />} 
                                    size="small" 
                                    danger 
                                    onClick={() => handleDeleteReview(review.reviewId)}
                                  >
                                    Delete
                                  </Button>
                                ] : []}
                              >
                                <div style={{ marginBottom: '8px' }}>
                                  <Text strong>{review.userName}</Text>
                                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                                    {review.date}
                                  </Text>
                                  {isUserReview && (
                                    <Tag color="blue" style={{ marginLeft: '8px' }}>Your Review</Tag>
                                  )}
                                </div>
                                <Rate disabled value={review.rating} />
                                <Paragraph>{review.comment}</Paragraph>
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <Paragraph>No reviews yet. Be the first to review this course!</Paragraph>
                      )}
                    </TabPane>
                  </Tabs>
                </>
              ) : (
                <Row justify="center" align="middle">
                  <Col xs={20} lg={5} style={{ maxHeight: '100vh' }}>
                    <Empty
                      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                      description={
                        <Typography.Text>
                          Please select a course from the list on the left to view its details.
                        </Typography.Text>
                      }
                    >
                    </Empty>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        </Row>
      </Content>

      <Modal
        title="Write a Review"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        onOk={handleSubmitReview}
        okText="Submit Review"
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>Your Rating:</Text>
          <div>
            <Rate value={userRating} onChange={setUserRating} />
          </div>
        </div>
        <div>
          <Text>Your Review:</Text>
          <Input.TextArea
            rows={4}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share your experience with this course..."
          />
        </div>
      </Modal>

      <Modal
        title="Edit Review"
        open={editReviewModalVisible}
        onCancel={() => setEditReviewModalVisible(false)}
        onOk={handleUpdateReview}
        okText="Update Review"
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>Your Rating:</Text>
          <div>
            <Rate value={editReviewRating} onChange={setEditReviewRating} />
          </div>
        </div>
        <div>
          <Text>Your Review:</Text>
          <Input.TextArea
            rows={4}
            value={editReviewComment}
            onChange={(e) => setEditReviewComment(e.target.value)}
            placeholder="Update your experience with this course..."
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default SearchCoursePage;