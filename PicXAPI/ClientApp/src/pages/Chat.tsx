import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface User {
  userId: number;
  name: string;
}

interface ChatMessage {
  chatId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  message: string;
  isRead: boolean;
  sentAt: string;
}

const Chat = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesMap, setMessagesMap] = useState<{ [userId: number]: ChatMessage[] }>({});
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRequestedUserId = useRef<number | null>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    const newConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7162/chatHub', {
        accessTokenFactory: () => token || ""
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    newConnection
      .start()
      .then(() => {
        console.log('SignalR connected to: https://localhost:7162/chatHub');
        newConnection.on('ReceiveCurrentUserId', (userId: number) => {
          console.log('Current UserId:', userId);
          setCurrentUserId(userId);
        });

        newConnection.on('ReceiveUserList', (users: User[]) => {
          console.log('Users received:', users);
          setUsers(users);
        });

        newConnection.on('ReceiveMessage', (message: ChatMessage) => {
          setMessagesMap(prev => {
            const otherUserId =
              message.senderId === currentUserId ? message.receiverId : message.senderId;
            const oldMessages = prev[otherUserId] || [];
            return {
              ...prev,
              [otherUserId]: [...oldMessages, message]
            };
          });

          if (message.receiverId === currentUserId && message.senderId === selectedUserId) {
            newConnection.invoke('MarkMessageAsRead', message.chatId);
          }
        });

        newConnection.on('ReceiveChatHistory', (history: any[]) => {
          const userId = lastRequestedUserId.current;
          if (!userId) return;
          const mapped = history.map(msg => ({
            chatId: msg.ChatId ?? msg.chatId,
            senderId: msg.SenderId ?? msg.senderId,
            senderName: msg.SenderName ?? msg.senderName,
            receiverId: msg.ReceiverId ?? msg.receiverId,
            message: msg.Message ?? msg.message,
            isRead: msg.IsRead ?? msg.isRead,
            sentAt: msg.SentAt ?? msg.sentAt,
          }));
          setMessagesMap(prev => ({
            ...prev,
            [userId]: mapped
          }));
        });

        newConnection.on('MessageRead', (chatId: number) => {
          console.log('Message read:', chatId);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.chatId === chatId ? { ...msg, IsRead: true } : msg
            )
          );
        });

        newConnection.invoke('GetCurrentUserId').catch((err) => {
          setError('Không thể lấy thông tin người dùng.');
          console.error('GetCurrentUserId error:', err);
        });

        setError(null);
      })
      .catch((err) => {
        setError('Không thể kết nối chat. Vui lòng kiểm tra đăng nhập hoặc thử lại.');
        console.error('SignalR connection error:', err);
      });

    return () => {
      newConnection?.stop();
      console.log('SignalR connection stopped');
    };
  }, []);

 const currentMessages = selectedUserId ? messagesMap[selectedUserId] || [] : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const selectUser = async (userId: number) => {
    setSelectedUserId(userId);
    lastRequestedUserId.current = userId;
    if (connection) {
      await connection.invoke('GetChatHistory', userId);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connection || !newMessage.trim() || !selectedUserId) return;

    try {
      await connection.invoke('SendPrivateMessage', selectedUserId, newMessage.trim());
      // Optimistic update
      const now = new Date().toISOString();
      setMessagesMap(prev => {
        const oldMessages = prev[selectedUserId!] || [];
        return {
          ...prev,
          [selectedUserId!]: [
            ...oldMessages,
            {
              chatId: Date.now(), // temporary id
              senderId: currentUserId,
              senderName: users.find(u => u.userId === currentUserId)?.name || '',
              receiverId: selectedUserId!,
              message: newMessage.trim(),
              isRead: false,
              sentAt: now,
            }
          ]
        };
      });
      setNewMessage('');
    } catch (err) {
      setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
      console.error('Send message error:', err);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate('/')}>Quay về trang chủ</Button>
      </div>
    );
  }

  

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Chat</h1>
      <div className="bg-white rounded-lg shadow-md flex">
        <div className="w-1/3 border-r border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-4">Người dùng</h2>
          {users.length === 0 ? (
            <p className="text-gray-500">Không có người dùng nào khả dụng</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user.userId}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                    selectedUserId === user.userId ? 'bg-indigo-100' : ''
                  }`}
                  onClick={() => selectUser(user.userId)}
                >
                  {user.name || `User #${user.userId}`}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-2/3 flex flex-col">
          {selectedUserId ? (
            <>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {users.find((u) => u.userId === selectedUserId)?.name || 'Chat'}
                </h2>
              </div>
              <div className="flex-1 h-[600px] overflow-y-auto p-4 space-y-4">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.chatId}
                    className={`flex ${
                      msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === currentUserId
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === currentUserId ? 'text-indigo-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.sentAt).toLocaleTimeString()}
                        {msg.senderId === currentUserId && msg.isRead && (
                          <span className="ml-2">Đã đọc</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || !selectedUserId}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Chọn một người dùng để bắt đầu chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;