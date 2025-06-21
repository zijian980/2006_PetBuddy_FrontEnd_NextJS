"use client"

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  message_content: string;
  message_timestamp: string;
  sender_id: number;
  recipient_id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  name?: string; 
}

const ChatRoom: React.FC<{ params: { id: string } }> = ({ params }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipient, setRecipient] = useState<User | null>(null);
  const [recipientProfilePicture, setRecipientProfilePicture] = useState('/johndoe.png');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch user details, profile picture, and messages
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('access_token');
      const currentUserType =sessionStorage.getItem('profile_type');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const userResponse = await axios.get<User>(`http://localhost:8000/users/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setRecipient(userResponse.data);

        // Fetch profile picture
        try {
          const pictureResponse = await axios.get(
            `http://localhost:8000/users/${params.id}/profile-picture`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              responseType: 'blob'
            }
          );
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setRecipientProfilePicture(imageUrl);
        } catch (pictureErr) {
          console.log(`Error fetching profile picture for user ${params.id}`);
        }

        try{
          const endpoint = currentUserType === '2'
            ? `http://localhost:8000/petowner/${params.id}`
            : `http://localhost:8000/caretaker/${params.id}`;

          const nameResponse = await axios.get(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          setRecipient(prev => prev ? { ...prev, name: nameResponse.data.name } : null);
        } catch (nameErr) {
          console.log(`Error fetching name for user ${params.id}`);
        }

        // Then fetch messages using the username
        const messagesResponse = await axios.get<Message[]>(
          `http://localhost:8000/message/${userResponse.data.username}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        setMessages(messagesResponse.data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/login');
        }
        setError('Failed to load conversation');
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (recipientProfilePicture.startsWith('blob:')) {
        URL.revokeObjectURL(recipientProfilePicture);
      }
    };
  }, [params.id, router]);

  // Set up WebSocket connection
  useEffect(() => {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);

    ws.onopen = () => {
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      try {
        // Parse the incoming message
        const data = JSON.parse(event.data);
        
        // Check if it's a message type and has content
        if (data.type === 'message' && data.content) {
          // Only use the content part of the message
          const messageContent = data.content;
          
          if (recipient) {
            const newMessage: Message = {
              id: Date.now(), // temporary ID
              message_content: messageContent, // Use just the content
              message_timestamp: new Date().toISOString(),
              sender_id: Number(params.id),
              recipient_id: Number(sessionStorage.getItem('user_id'))
            };
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();
          }
        }
      } catch (parseError) {
        // If the message isn't JSON, treat it as plain text
        const messageContent = event.data;
        if (recipient) {
          const newMessage: Message = {
            id: Date.now(),
            message_content: messageContent,
            message_timestamp: new Date().toISOString(),
            sender_id: Number(params.id),
            recipient_id: Number(sessionStorage.getItem('user_id'))
          };
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [params.id, recipient]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipient) return;

    const token = sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8000/message/${recipient.username}`,
        {
          message_content: newMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error sending message:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        sessionStorage.clear();
        router.push('/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  const currentUserId = Number(sessionStorage.getItem('user_id'));

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/messages">
            <span className="text-orange-500 mr-4">←</span>
          </Link>
          <Image 
            src={recipientProfilePicture} 
            alt={recipient?.name || recipient?.username || 'User'} 
            width={40} 
            height={40} 
            className="rounded-full object-cover w-[50px] h-[50px] mr-2"
          />
          <span className="font-bold">{recipient?.name || recipient?.username || 'User'}</span>
        </div>
      </div>
  
      <div className="poppins flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={message.id || index} className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              message.sender_id === currentUserId 
                ? 'bg-orange-100 self-end' 
                : 'bg-white self-start'
            }`}>
              <p className="text-sm">{message.message_content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.message_timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
  
      <form onSubmit={handleSendMessage} className="bg-white p-4 flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your message here..."
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button type="submit" className="ml-4">
          <span className="text-orange-500">Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;