"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

interface BookingEvent {
    start: string;
    end: string;
    location: string;
    service: string;
    status: string;
    other_user_name: string;
    pet_name: string;
  }

const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'petowner' | 'caretaker' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBookingHistory = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');
      const profileType = sessionStorage.getItem('profile_type');

      if (!token || !userId) {
        router.push('/signout/login');
        return;
      }

      // Set user type based on profile type
      setUserType(profileType === '2' ? 'caretaker' : 'petowner');

      try {
        const response = await axios.get<{ events: BookingEvent[] }>(
          `http://localhost:8000/calendar/history/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setBookings(response.data.events);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking history:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError('Failed to load booking history');
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [router]);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 pb-20">
      <div className="flex items-center mb-6">
        <Link 
          href={userType === 'caretaker' ? '/profile-caretaker' : '/profile-petOwner'} 
          className="text-orange-500 mr-4"
        >
          ←
        </Link>
        <h1 className="jua text-2xl font-bold">Booking History</h1>
      </div>

      <div className="poppins space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking, index) => (
            <div key={index} className="bg-orange-50 rounded-lg p-4 shadow-md">
              <div className="flex items-start space-x-4">
                <Image
                  src="/kimmydog.png"
                  alt={booking.service}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{booking.service}</h3>
                      <p className="text-gray-600">with {booking.other_user_name}</p>
                      <p className="text-sm text-gray-600">for {booking.pet_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {formatDateTime(booking.start)} - {formatDateTime(booking.end)}
                  </p>
                  <p className="text-gray-600">{booking.location}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No booking history found
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistoryPage;