import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages] = useState([
    {
      id: 1,
      sender_id: 'other',
      message: "Hi, I'm interested in your artwork",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      sender_id: 'user',
      message: 'Thank you! Which piece caught your eye?',
      timestamp: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: 3,
      sender_id: 'other',
      message: 'The abstract landscape painting. Is it still available?',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: Implement message sending logic
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        <div className="h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender_id === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender_id === 'user' ? 'text-indigo-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;