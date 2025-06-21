"use client"

import { useEffect, useState } from 'react';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: {text: string, html: string};
  description: {text: string, html: string};
  url: string;
  start: {local: string};
  end: {local: string};
  logo: {original: {url: string}};
}

export default function ViewEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const token = sessionStorage.getItem('access_token');
      
      if (!token) {
        router.push('/signout/login');
        return;
      }

      try {
        const response = await axios.get<Event[]>('http://localhost:8000/eventbrite/events', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEvents(response.data.events);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching eventbrite:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError('Failed to load eventbrite');
        setLoading(false);
      }
    };

    fetchEvents();
  }, [router]);

  /* useEffect(() => {
    console.log("HomePage mounted");
    return () => console.log("HomePage unmounted");
  }, []);

  useEffect(() => {
    console.log('Events state updated:', events);
  }, [events]); */

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
    <div className="p-8">
      <Link href="/homepage">
        <div className="text-orange-500 text-5xl mb-4 ml-16 inline-block">←</div>
      </Link>
      <h1 className="jua text-3xl font-bold mb-8 text-center">View Events</h1>
      <div className="poppins space-y-8">
        {events.map(event => (
          <Link href={event.url} key={event.id}>
            <div className="w-full flex justify-center items-center">
              <div className="flex items-center justify-center p-4 w-full border-t-4 border-orange-500">
                <Image
                  src={event.logo.original.url}
                  alt={event.name.text}
                  width={128}
                  height={128}
                  className="rounded-lg object-cover"
                />
                <div className="ml-4 flex-1">
                  <h2 className="text-xl font-semibold">{event.name.text}</h2>
                  <p className="text-gray-600">{format(new Date(event.start.local), 'yyyy-MM-dd HH:mm')} - {format(new Date(event.end.local), 'yyyy-MM-dd HH:mm')}</p>
                  <p className="text-gray-600">{event.description.text}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}