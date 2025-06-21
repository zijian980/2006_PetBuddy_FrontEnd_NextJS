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

const EventCard: React.FC<{
  title: string;
  imageUrl: string;
  url: string;
  start: string;
  end: string;
}> = ({ title, imageUrl, url, start, end }) => {
  const formattedStart = format(new Date(start), 'yyyy-MM-dd HH:mm');
  const formattedEnd = format(new Date(end), 'yyyy-MM-dd HH:mm');

  return(<Link href={url}>
    <div className="relative w-full h-48">
      <Image
        src={imageUrl}
        alt={title}
        width={120}
        height={120}
        className="rounded-lg w-full h-full object-contain"
        style={{ objectPosition: 'center' }} 
      />
      <div className="poppins absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
        {title}<br />
        {formattedStart} - {formattedEnd}
      </div>
    </div>
    </Link>);
};
const ServiceCard: React.FC<{
  title: string;
  imageUrl: string;
  href: string;
}> = ({ title, imageUrl, href }) => (
  <Link href={href}>
    <div className="w-40 h-40 bg-white text-black flex flex-col items-center justify-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <Image
        src={imageUrl}
        alt={title}
        width={100}
        height={100}
        objectFit="cover"
        className="rounded-lg"
      />
      <span className="jua mt-2">{title}</span>
    </div>
  </Link>
);

export default function HomePage() {
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

    console.log(events);

  return (
    <div className="bg-white min-h-screen pb-20">
      <main className="p-4">
        <section className="mb-8">
          <h2 className="jua text-xl font-bold border-l-4 border-orange-500 pl-2 mb-4">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {events.length > 0 && events.map((event, index) => index < 3 && (
              <EventCard 
                key={event.id}
                title={event.name.text}
                imageUrl={event.logo.original.url}
                url={event.url}
                start={event.start.local}
                end={event.end.local}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="jua text-xl font-bold border-l-4 border-orange-500 pl-2 mb-4">
            Services
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <ServiceCard
              title="Upcoming Bookings"
              imageUrl="/bookings.png"
              href="/upcoming-bookings"
            />
            <ServiceCard
              title="View events"
              imageUrl="/events.png"
              href="/view-events"
            />
          </div>
        </section>
      </main>
    </div>
  );
};
