"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import moment from 'moment-timezone';

interface BookingEvent {
  start: string;
  end: string;
  location: string;
  description: string;
  summary: string;
}

export default function UpcomingBookings() {
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
          `http://localhost:8000/calendar/upcoming/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const fetchedBookings = response.data.events;

        // Check if no bookings are found, avoid setting error state
        if (fetchedBookings.length === 0) {
          setBookings([]);
        } else {
          setBookings(fetchedBookings);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking history:', err);
        setError('Failed to load booking history');
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  // Only show the error message if there's an actual error, not if bookings are empty
  if (error && bookings.length > 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-center mb-8">
        <Link href="/homepage">
          <div className="text-orange-500 text-3xl mr-4 inline-block">←</div>
        </Link>
        <h1 className="jua text-3xl font-bold text-center">Upcoming Bookings</h1>
      </div>
      <div className="poppins space-y-8">
        {/* If no bookings, show 'No upcoming bookings' */}
        {bookings.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No upcoming bookings</div>
        ) : (
          bookings.map(event => (
            <Link key={event.start} href={`/upcoming-bookings/event/${event.start}`}>
              <div className="w-full cursor-pointer">
                <div className="border-t-4 border-orange-500"></div>
                <div className="flex items-center justify-center p-4">
                  <Image
                    src="/dog.png"
                    alt={event.summary}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold">{event.summary}</h2>
                    <p className="text-gray-600">
                      {moment.tz(event.start, "Asia/Singapore").format("MM/DD/YYYY h:mm A")} - {moment.tz(event.end, "Asia/Singapore").format("MM/DD/YYYY h:mm A")}
                    </p>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="border-t-4 border-orange-500"></div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
