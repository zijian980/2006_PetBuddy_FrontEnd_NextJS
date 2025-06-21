"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: number;
  username: string;
  email: string;
  created_at: string;
  profilePicture: string;
  name?: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      const token = sessionStorage.getItem('access_token');
      
      if (!token) {
        router.push('/signout/login');
        return;
      }

      try {
        const response = await axios.get<Conversation[]>('http://localhost:8000/message/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const conversationsWithDetails = await Promise.all(
          response.data.map(async (conversation) => {
            const userId = conversation.id;
            let profilePicture = '/johndoe.png';
            let name = conversation.username;

            try {
              const pictureResponse = await axios.get(
                `http://localhost:8000/users/${userId}/profile-picture`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  responseType: 'blob'
                }
              );
              const imageUrl = URL.createObjectURL(pictureResponse.data);
              profilePicture = imageUrl;
            } catch (pictureErr) {
              console.log(`Error fetching profile pic for user ${userId}`);
            }

            try {
              const currentUserType = sessionStorage.getItem('profile_type');
              const endpoint = currentUserType === '2'
              ? `http://localhost:8000/petowner/${userId}`
              : `http://localhost:8000/caretaker/${userId}`;

              const userResponse = await axios.get(endpoint, {
                headers: {'Authorization': `Bearer ${token}`}
              });

              name=userResponse.data.name;
            } catch (nameErr) {
              console.log(`Error fetching details for user ${userId}`);
            }

            return {
              ...conversation,
              profilePicture,
              name
            };
          })
        );

        setConversations(conversationsWithDetails);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div>
      <div className="jua flex items-center justify-center w-full bg-white py-3">
        <h1 className="text-3xl font-bold text-center">My Chats</h1>
      </div>
      <div className="poppins space-y-8">
        {conversations.map(conversation => (
          <Link key={conversation.id} href={`/messages/${conversation.id}`}>
            <div className="w-full cursor-pointer">
              <div className="border-t-4 border-gray-50"></div>
              <div className="flex items-center justify-center p-4">
                <Image
                  src={conversation.profilePicture}
                  alt={conversation.name || conversation.username}
                  width={50}
                  height={50}
                  className="rounded-full object-cover w-[60px] h-[60px]"
                />
                <div className="ml-4 flex-grow">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg">{conversation.name || conversation.username}</h2>
                    <p className="text-gray-600 text-sm">Recent</p>
                  </div>
                  <p className="text-gray-600 text-sm">Click to view conversation</p>
                </div>
              </div>
              <div className="border-t-4 border-orange-500"></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}