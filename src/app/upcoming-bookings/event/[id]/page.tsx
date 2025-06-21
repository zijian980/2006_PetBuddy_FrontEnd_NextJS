'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

interface BookingEvent {
  start: string;
  end: string;
  location: string;
  description: string;
  summary: string;
}

const token = sessionStorage.getItem('access_token');
const userId = sessionStorage.getItem('user_id');
const profileType = sessionStorage.getItem('profile_type');

export default function EventDetails() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();

  const [booking, setBooking] = useState<BookingEvent | null>(null);
  const [caretakerName, setCaretakerName] = useState<string | null>(null);
  const [successEdit, setSuccessEdit] = useState(false);
  const [successCancel, setSuccessCancel] = useState(false);
  const [petName, setPetName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'petowner' | 'caretaker' | null>(null);
  const router = useRouter();

  // Fetch booking history
  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (!token || !userId) {
        router.push('/signout/login');
        return;
      }

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
        setBooking(response.data.events.find(event => event.start === id) || null);
      } catch (err) {
        console.error('Error fetching booking history:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError('Failed to load booking history');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingHistory();
  }, [router, id]);

  // Parse IDs from booking description
  const description = booking?.description || "";
  const regex = /Petowner ID: (\d+), Caretaker ID: (\d+), Pet ID: (\d+), Service ID: (\d+)/;
  const matches = description.match(regex);

  const petownerId = matches ? matches[1] : null;
  const caretakerId = matches ? matches[2] : null;
  const petId = matches ? matches[3] : null;
  const serviceId = matches ? matches[4] : null;

  // Fetch details for caretaker and pet once booking is available
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!petownerId || !petId) return;

      try {
        const caretakerResponse = await axios.get(
          `http://localhost:8000/caretaker`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log(caretakerResponse.data);
        setCaretakerName(caretakerResponse.data[0]?.name || null);

        const petResponse = await axios.get(
          `http://localhost:8000/pet/${petownerId}/${petId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log(petResponse.data);
        setPetName(petResponse.data?.pet_name || null);

      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details');
      }
    };

    fetchBookingDetails();
  }, [router, petownerId, petId]);

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

  if (!booking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Booking not found</div>
      </div>
    );
  }

  const handleCancelBooking = async () => {
    try {
      const response = await axios.delete(`http://localhost:8000/calendar/${caretakerId}/${serviceId}/${petId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 204) {
        setSuccessCancel(true);
        setTimeout(() => {
          router.push('/upcoming-bookings');
        }, 1000);
      }

    } catch (err) {
      console.error('Error canceling booking:', err);
      setError('Failed to cancel booking');
    }
  };

  const handleEditBooking = async () => {
    sessionStorage.setItem('editBookingPet', JSON.stringify({ petId, petName, start: booking?.start, location: booking?.location }));
    router.push(`/search/caretaker/${caretakerId}/${serviceId}/editBooking`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 w-full max-w-lg">
        <div className="flex items-center justify-center mb-8">
          <Link href="/upcoming-bookings">
            <div className="text-orange-500 mr-4 text-3xl">←</div>
          </Link>
          <h1 className="jua text-3xl font-bold text-center">Manage Booking</h1>
        </div>
        <div className="flex items-center justify-center poppins mb-8">
          <Image
            src="/dog.png"
            alt={booking.summary}
            width={128}
            height={128}
            className="rounded-full mr-4"
          />
          <h1 className="text-3xl font-bold">{booking.summary}</h1>
        </div>
        <div className="flex flex-col items-center poppins">
          <p className="text-gray-600 mb-2">Caretaker: {caretakerName || caretakerId}</p>
          <p className="text-gray-600 mb-2">Pet: {petName || petId}</p>
          <p className="text-gray-600 mb-2">Date: {format(new Date(booking.start), 'Pp')} - {format(new Date(booking.end), 'Pp')}</p>
          <p className="text-gray-600 mb-2">Location: {booking.location}</p>
          <div className="flex gap-4">
            <button onClick={handleEditBooking} className="bg-orange-500 text-white px-4 py-2 rounded">Change Time</button>
            <button onClick={handleCancelBooking} className="bg-orange-500 text-white px-4 py-2 rounded">Cancel Booking</button>
          </div>
          {successEdit && <div className="text-green-500 mt-4">Booking successfully edited</div>}
          {successCancel && <div className="text-green-500 mt-4">Booking successfully canceled. Redirecting...</div>}
        </div>
      </div>
    </div>
  );
}
