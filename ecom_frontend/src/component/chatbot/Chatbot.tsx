import React, { useState } from 'react';
import { Button, Input, List, Typography } from 'antd';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');

  const handleSend = async () => {
    if (!userInput.trim()) return;

    // Add the user message to the message list
    const userMessage: ChatMessage = { sender: 'user', text: userInput.trim() };
    setMessages((prev) => [...prev, userMessage]);

    // Make the API call
    try {
      const response = await fetch('http://localhost:8000/chatbot/get_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg: userInput,
          choice: 2
        })
      });

      if (!response.ok) {
        throw new Error('Error calling ChatBot API');
      }

      const data = await response.json();
      const botReply = data.response || 'Sorry, no response.';

      // Add the bot response to the message list
      setMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error('ChatBot Error:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Oops! Something went wrong. Please try again later.' }
      ]);
    }

    // Clear the user input field
    setUserInput('');
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '400px',
        margin: '20px auto',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '16px',
        background: '#fff'
      }}
    >
      <List
        dataSource={messages}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <Typography.Text strong>
              {item.sender === 'user' ? 'You: ' : 'Bot: '}
            </Typography.Text>
            <Typography.Text>{item.text}</Typography.Text>
          </List.Item>
        )}
        style={{ marginBottom: '12px' }}
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
  );
};

export default ChatBot;
