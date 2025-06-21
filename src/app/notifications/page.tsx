"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Notification {
  id: number;
  header: string;
  detail: string;
  created_at: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');

      if (!token || !userId) {
        router.push('/signout/login');
        return;
      }

      try {
        const response = await axios.get<Notification[]>(`http://localhost:8000/notification/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setNotifications(response.data);
        sessionStorage.setItem('notifications', 'false'); // Set session storage item to false
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError('Failed to load notifications');
        setLoading(false);
      }
    };

    fetchNotifications();
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

  // Function to extract and shorten clickable links
  const renderDetailWithLink = (detail: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const dateRegex = /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\b/g;
    
    const parts = detail.split(urlRegex).map((part) => {
      // Process dates within each part
      return part.split(' ').map((subPart) => {
        if (dateRegex.test(subPart)) {
          subPart = subPart.replace('T', ' ');
        }
        return subPart; // Non-date portions remain unchanged
      }).join(' ');
    }).join('');

    return parts.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          Booking details
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      <div className="jua flex items-center justify-center w-full bg-white py-3">
        <h1 className="text-3xl font-bold text-center">Notifications</h1>
      </div>
      <div className="poppins space-y-8 p-4">
      {[...notifications].reverse().map((notification) => (
          <div key={notification.id} className="w-full cursor-pointer border-b border-gray-200 pb-4">
            <div className="flex items-start">
              {/* Bell icon fixed on the left */}
              <Image
                src="/bell-icon.png" // Replace with your bell icon image path
                alt="Notification Bell Icon"
                width={50}
                height={50}
                className="object-cover w-[60px] h-[60px]"
              />
              {/* Notification text on the right */}
              <div className="ml-4 flex flex-col flex-grow">
                <h2 className="text-lg font-bold mb-1">{notification.header}</h2>
                <p className="text-gray-600 text-sm mb-2">{renderDetailWithLink(notification.detail)}</p>
                <p className="text-gray-400 text-xs">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
