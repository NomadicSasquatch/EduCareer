import React, { useEffect, useState } from 'react';
import {
  Typography, Row, Col, Button, Card, List, Input
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setVisibleCards } from '../redux/slices/carouselSlice';
import type { RootState } from '../redux/store';
import ReactMarkdown from 'react-markdown';

const { Title, Paragraph } = Typography;

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  isThinking?: boolean;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const visibleCards = useSelector((state: RootState) => state.carousel.visibleCards);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 1000) dispatch(setVisibleCards(1));
      else if (width < 1300) dispatch(setVisibleCards(2));
      else dispatch(setVisibleCards(3));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text) return;
  
    setUserInput('');
  
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setMessages(prev => [...prev, { sender: 'bot', text: 'Let me think...', isThinking: true }]);
  
    try {
      const response = await fetch('http://localhost:8000/chatbot/get_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: text, choice: 2 }),
      });
  
      if (!response.ok) throw new Error('ChatBot API request failed');
      const data = await response.json();
      const botReply = data.response || 'Sorry, no response.';
  
      setMessages(prev => {
        const newMessages = [...prev];
        const thinkingIndex = newMessages.findIndex(m => m.isThinking);
        if (thinkingIndex !== -1) {
          newMessages[thinkingIndex] = { sender: 'bot', text: botReply, isThinking: false };
        }
        return newMessages;
      });
    } catch (err) {
      console.error('ChatBot error:', err);
      setMessages(prev => {
        const newMessages = [...prev];
        const thinkingIndex = newMessages.findIndex(m => m.isThinking);
        if (thinkingIndex !== -1) {
          newMessages[thinkingIndex] = {
            sender: 'bot',
            text: 'Oops! Something went wrong. Please try again later.',
            isThinking: false,
          };
        }
        return newMessages;
      });
    }
  };
  
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '500px',
          backgroundColor: '#222222',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <div>
          <Title style={{ color: '#fff', fontSize: '3rem' }}>Welcome to Our Platform</Title>
          <Paragraph style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>
            Need Career Advice? Talk to our AI Chatbot!
          </Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '120px', padding: '0 20px', height: '400px' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '95%',
            margin: '40px auto',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            padding: '16px',
            background: '#fff',
          }}
        >
          <List
            dataSource={messages}
            locale={{ emptyText: "Talk to me! I can give career advice" }}
            renderItem={(item, idx) => (
              <List.Item key={idx}>
                <strong style={{ marginRight: '8px' }}>
                  {item.sender === 'user' ? 'You:' : 'Bot:'}
                </strong>
                {/* Render Markdown for the message */}
                <div style={{ overflowWrap: 'anywhere' }}>
                  <ReactMarkdown>{item.text}</ReactMarkdown>
                </div>
              </List.Item>
            )}
            style={{
              marginBottom: '12px',
              maxHeight: '300px',   
              overflowY: 'auto',  
            }}
          />

          <Input.TextArea
            rows={2}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask for career advice..."
            style={{ marginBottom: '8px' }}
          />
          <Button type="primary" onClick={handleSend}>
            Send
          </Button>
        </div>
      </Row>
    </div>
  );
};

export default HomePage;
