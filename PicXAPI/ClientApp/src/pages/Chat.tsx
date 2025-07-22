import React, { useEffect, useState, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { ChevronLeft, MessageCircle, Send, X } from 'lucide-react';
import { formatRelativeTime } from '../lib/utils';

interface User {
    userId: number;
    name: string;
    latestMessage?: {
        message: string;
        sentAt: string;
    } | null;
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

const Chat = ({ onClose }: { onClose: () => void }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [messagesMap, setMessagesMap] = useState<{ [userId: number]: ChatMessage[] }>({});
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastRequestedUserId = useRef<number | null>(null);

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
                    users.forEach(user => {
                        lastRequestedUserId.current = user.userId;
                        newConnection.invoke('GetChatHistory', user.userId).catch(err => {
                            console.error(`Error fetching chat history for user ${user.userId}:`, err);
                        });
                    });
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
                    setMessagesMap(prev => {
                        const updatedMap = { ...prev };
                        Object.keys(updatedMap).forEach(userId => {
                            updatedMap[userId] = updatedMap[userId].map(msg =>
                                msg.chatId === chatId ? { ...msg, isRead: true } : msg
                            );
                        });
                        return updatedMap;
                    });
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
            const now = new Date().toISOString();
            setMessagesMap(prev => {
                const oldMessages = prev[selectedUserId!] || [];
                return {
                    ...prev,
                    [selectedUserId!]: [
                        ...oldMessages,
                        {
                            chatId: Date.now(),
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

    const handleBackToUserList = () => {
        setSelectedUserId(null);
    };

    return (
        <div className="fixed top-3 h-[calc(100vh-32px)] w-96 left-24 z-50">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full h-full transition-all duration-300">
                {/* Header */}
                {selectedUserId ? (
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 rounded-t-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleBackToUserList}
                                className="p-2 hover:bg-gray-200 rounded transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {users.find(u => u.userId === selectedUserId)?.name.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <h3 className="font-medium">
                                {users.find(u => u.userId === selectedUserId)?.name || 'User'}
                            </h3>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 rounded-t-xl">
                        <div className="flex items-center space-x-2">
                            <MessageCircle className="w-7 h-7" />
                            <h3 className="font-medium text-xl">Chat</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-200 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="h-[calc(100%-3.5rem)] overflow-hidden flex">
                    {/* User List */}
                    {!selectedUserId && (
                        <div className="w-full p-3 overflow-y-auto scrollbar-hide">
                            {users.length === 0 ? (
                                <p className="text-gray-500 text-sm">Không có người dùng nào khả dụng</p>
                            ) : (
                                <div className="space-y-2">
                                    {users.map((user) => {
                                        let message = '';
                                        let sentAt = '';
                                        if (user.latestMessage) {
                                            message = user.latestMessage.message;
                                            sentAt = user.latestMessage.sentAt
                                                ? formatRelativeTime(user.latestMessage.sentAt)
                                                : '';
                                        }
                                        return (
                                            <div
                                                key={user.userId}
                                                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors"
                                                onClick={() => selectUser(user.userId)}
                                            >
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                                                    {(user.name || `User #${user.userId}`).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user.name || `User #${user.userId}`}
                                                    </p>
                                                    <div className="flex justify-between">
                                                        <p className="text-xs text-gray-500">
                                                            {message ? `${message}` : 'Chưa có tin nhắn mới'}
                                                        </p>
                                                        <span className="text-xs">{sentAt}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Chat Window */}
                    {selectedUserId && (
                        <div className="flex flex-col w-full">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {currentMessages.map((msg) => (
                                    <div
                                        key={msg.chatId}
                                        className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl px-3 py-2 ${msg.senderId === currentUserId
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p
                                                className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-50 border-t border-red-200">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;