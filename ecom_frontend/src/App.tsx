import React, { FC } from 'react';
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import NavBar, { NavConfig } from './component/navBar/navBar';
import HomePage from './view/HomePage';
import NotFoundPage from './global/NotFoundPage';
import LoginPage from './view/LoginPage';
import RegisterationPage from './view/RegisterationPage';
import LearnerProfilePage from './view/LearnerProfilePage';
import ContactFeedbackPage from './view/ContactFeedbackPage';
import SearchCoursePage from './view/SearchCoursePage';
import CheckoutPage from './view/CheckoutPage';
import AdminManagementPage from './view/AdminManagementPage';
import ProviderCreateCoursePage from './view/ProviderCreateCoursePage';
import ProviderDashboard from './view/ProviderDashboard';
import CourseDetailPage from './view/CourseDetailPage';
import ForgetPasswordPage from './view/ForgetPasswordPage';
import AdminCreationPage from './view/AdminCreationPage';
import LearnerDashboard from './view/LearnerDashboard';
import CourseModuleDetailPage from './view/CourseModuleDetailPage';

const { Header, Footer, Content } = Layout;

// Example: if the user is logged in, you might have their data in sessionStorage.
// Here we check if there's a logged-in user and build a learner profile URL accordingly.
const loggedUserString = sessionStorage.getItem('user');
const loggedUser = loggedUserString ? JSON.parse(loggedUserString) : null;
const profileLink = loggedUser ? `/learnerProfile/${loggedUser.userID}` : '/login';

const navConfig: NavConfig = {
  navBarTheme: 'dark',
  navLayout: 'horizontal',
  leftNavItems: [
    { key: 'home', label: <Link to="/">Home</Link> },
    {
      key: 'searchCourse',
      label: <Link to="/searchCourse">Upskill Now</Link>,
      style: { backgroundColor: 'red' },
    },
    { key: 'contactus', label: <Link to="/contactus">Contact Us</Link> },
  ],
  rightNavItems: loggedUser
    ? [
      { key: 'profile', label: <Link to={profileLink}>Profile</Link> },
    ]
    : [
      { key: 'login', label: <Link to="/login">Login</Link> },
      { key: 'register', label: <Link to="/register">Register</Link> },
    ],
};

const App: FC = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <div className="logo" />
          <NavBar
            navBarTheme={navConfig.navBarTheme}
            navLayout={navConfig.navLayout}
            leftNavItems={navConfig.leftNavItems}
            rightNavItems={navConfig.rightNavItems}
          />
        </Header>
        <Content
          style={{
            flex: 1,
            padding: '16px, 0px',
            overflow: 'hidden',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterationPage />} />
            <Route path="/learnerProfile" element={<LearnerProfilePage />} />
            <Route path="/searchCourse" element={<SearchCoursePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/contactus" element={<ContactFeedbackPage />} />
            <Route path="/adminManagementPage" element={<AdminManagementPage />} />
            <Route path="/forgetpassword" element={<ForgetPasswordPage />} />
            <Route path="/adminCreation" element={<AdminCreationPage />} />
            <Route path="/createcourse" element={<ProviderCreateCoursePage />} />
            <Route path="/providerDashboard" element={<ProviderDashboard />} />
            <Route path="/course-detail/:id" element={<CourseDetailPage />} />
            <Route path="/forgetpassword" element={<ForgetPasswordPage />} />
            <Route path="/adminCreation" element={<AdminCreationPage />} />
            <Route path="/LearnerDashboard" element={<LearnerDashboard />} />
            <Route path="/course-module-detail/:enrollmentId" element={<CourseModuleDetailPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center', backgroundColor: '#08072e', color: 'azure' }}>
          NTU Project
        </Footer>
      </Layout>
    </BrowserRouter>
  </Provider>
);

export default App;
