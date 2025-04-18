import React, { useEffect, useState } from 'react';
import { Menu, MenuProps, Dropdown, Avatar, Spin, Row, Col } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSession } from '../../hooks/useSession'; // Custom hook for session management
import { getUserFromSession } from '../../utils/sessionUtils';

export interface NavConfig {
  navBarTheme: 'light' | 'dark';
  navLayout: 'horizontal' | 'vertical' | 'inline';
  leftNavItems?: MenuProps['items'];
  rightNavItems?: MenuProps['items'];
}

interface User {
  id: string;
  username: string;
  avatar?: string;
  role: string;
}

const NavBar: React.FC<NavConfig> = (config) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchSession, logout } = useSession(); // Using the custom session hook
  // const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Fetch user session from sessionStorage on mount and when the route changes
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Parsed user from sessionStorage:', parsedUser);
      } catch (error) {
        console.error('Error parsing sessionStorage user:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // Call the logout method from the hook
      sessionStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    ...(user && user.role.toLowerCase() === 'learner'
      ? [
        {
          key: 'profile',
          label: 'Profile',
          onClick: () => {
            navigate(`/learnerProfile`);
          },
        },
        {
          key: 'learnerDashboard',
          label: 'Learner Dashboard',
          onClick: () => {
            navigate(`/LearnerDashboard`);
          },
        }
      ]
      : []),
    ...(user && user.role.toLowerCase() === 'provider'
      ? [
        {
          key: 'providerDashboard',
          label: 'Dashboard',
          onClick: () => navigate(`/providerDashboard`),
        },
      ]
      : []),
      ...(user && user.role.toLowerCase() === 'admin'
      ? [
        {
          key: 'adminManagement',
          label: 'Admin Management',
          onClick: () => navigate(`/adminManagementPage`),
        },
      ]
      : []),
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Spin spinning={isLoading || isLoggingOut} size="large">
      <Row justify="space-between" align="middle" style={{ width: '100%' }}>
        {/* Left Navigation */}
        <Col span={8}>
          <Menu
            theme={config.navBarTheme}
            mode={config.navLayout}
            items={config.leftNavItems}
            defaultSelectedKeys={['1']}
            onClick={({ key }) => navigate(key)}
          />
        </Col>

        {/* Right Navigation */}
        <Col span={4} offset={7}>
          {user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'whitesmoke',
                }}
              >
                {user.avatar ? (
                  <Avatar src={user.avatar} style={{ marginRight: 8 }} />
                ) : (
                  <Avatar style={{ marginRight: 8 }}>
                    {user.username[0].toUpperCase()}
                  </Avatar>
                )}
                {user.username}
              </div>
            </Dropdown>
          ) : (
            <Menu
              theme={config.navBarTheme}
              mode={config.navLayout}
              items={config.rightNavItems}
              onClick={({ key }) => navigate(key)}
            />
          )}
        </Col>
      </Row>
    </Spin>
  );
};

export default NavBar;
