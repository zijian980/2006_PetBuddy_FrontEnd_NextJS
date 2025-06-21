'use client';

import { use, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

interface Caretaker {
  name: string;
  dob: string;      
  gender: 'male' | 'female' | 'other';
  work_exp: number;
  service: Service[]; 
  user_id: number;
}

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface Service {
  service_id: number;
  service: string;
  service_rate: number;
  service_availability: DayOfWeek[];
  location: string[];
  review: Review[];
}

interface ServiceWithAverageRating {
  service_id: number;
  averageRating: number;
}

interface Review {
  service_id: number;
  rating: number;
  review_description: string;
  user_id: number;
  anonymous: boolean;
}

export default function CaretakerPage() {
  const [caretaker, setCaretaker] = useState<Caretaker | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const caretakerId = parseInt(pathname.split('/').pop() || '0', 10);
  const router = useRouter();
  const token = sessionStorage.getItem('access_token');

  useEffect(() => {
    if (!token) {
      router.push('/signout/login');
      return;
    }

    const fetchCaretaker = async () => {
      try {
        const response = await axios.get<Caretaker>(
          `http://localhost:8000/caretaker/${caretakerId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setCaretaker(response.data);
        setServices(response.data.service || []);
      } catch (err) {
        console.error('Error fetching caretakers:', err);
        setError('Failed to load caretaker');
      } finally {
        setLoading(false);
      }
    };

    fetchCaretaker();
  }, [caretakerId, token, router]);

  console.log('Caretaker:', caretaker);
  console.log('Services:', services);

  useEffect(() => {
    if (!token || !services.length) return;

    const fetchReviews = async () => {
      try {
        const reviewsData = await Promise.all(
          services.map(async service => {
            try {
              const response = await axios.get<Review[]>(
                `http://localhost:8000/review/${service.service_id}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              return response.data || [];
            } catch (err) {
              console.error(`Error fetching reviews for service ${service.service_id}:`, err);
              return [];
            }
          })
        );
        setReviews(reviewsData.flat());
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [services, token]);

  console.log('Reviews:', reviews);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  if (error || !caretaker) {
    return <div className="text-red-500 text-center p-4">Caretaker not found</div>;
  }

  const servicesWithAverageRating: ServiceWithAverageRating[] = services.map(service => {
    const serviceReviews = reviews.filter(review => review.service_id === service.service_id);
    const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = serviceReviews.length > 0 ? totalRating / serviceReviews.length : 0;
    return {
      service_id: service.service_id,
      averageRating: averageRating || 0
    };
  });

  return (
    <div className="p-8 justify-center items-center min-h-screen">
      <div className="flex items-center">
        <Link href="/search">
          <div className="text-orange-500 text-3xl mr-8 inline-block">←</div>
        </Link>
        <Image src='/janedoe.png' alt={caretaker.name} width={100} height={100} className="rounded-full" />
        <div className="ml-4 flex items-center justify-between w-full">
          <h1 className="jua text-2xl font-bold">{caretaker.name}</h1>
          <button 
            onClick={() => router.push(`/messages/${caretakerId}`)}
            className="poppins ml-auto flex items-center justify-center bg-orange-500 text-white px-3 py-1 rounded">
            <FontAwesomeIcon icon={faComment} className="mr-2"/> Chat
          </button>
        </div>
      </div>
      
      <div className="mt-4 poppins">
        <p className="mt-2">Gender: {caretaker.gender}</p>
        <p className="mt-2">DOB: {caretaker.dob}</p>
        <p className="mt-2">Experience: {caretaker.work_exp} years</p>
        
        <section className="w-full text-left">
          <h2 className="jua text-xl font-bold border-l-4 border-orange-500 pl-2 mt-8">Services Offered:</h2>
        </section>

        <div className="mt-2 flex flex-col gap-4 w-full max-w-xl mx-auto">
          {caretaker.service.map((service, index) => {
            const serviceRating = servicesWithAverageRating.find(
              s => s.service_id === service.service_id
            )?.averageRating || 0;

            return (
              <div key={index} className="bg-white text-black flex flex-col items-center justify-center rounded-lg shadow-lg p-6 w-full">
                <Image src='/dog.png' alt={service.service} width={60} height={60} className="rounded-lg" />
                <div className="text-center mt-4 w-full">
                  <p className="jua text-2xl">{service.service}</p>
                  <p className="poppins text-lg mt-2">
                    {'⭐'.repeat(Math.round(serviceRating))}
                    {` (${serviceRating.toFixed(1)})`}
                  </p>
                  <p className="poppins mt-2">Availability: {service.service_availability.join(', ')}</p>
                  <p className="poppins mt-2">Rates (per session): ${service.service_rate}</p>
                  <p className="poppins mt-2">Location: {service.location.join(', ')}</p>
                  <Link href={`/search/caretaker/${caretakerId}/${service.service_id}`} className="block mt-4">
                    <button className="poppins bg-orange-500 text-white px-6 py-3 rounded hover:bg-orange-600 transition-colors w-full sm:w-auto">
                      View Service
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}