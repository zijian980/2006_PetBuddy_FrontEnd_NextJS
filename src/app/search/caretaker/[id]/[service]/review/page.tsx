'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Type for days of the week
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Type for service details
interface Caretaker {
    name: string;
    dob: string;      
    gender: 'male' | 'female' | 'other';
    work_exp: number;
    service: Service[]; 
    user_id: number;
    user: User;
  }

interface Service {
  service_id: number;
  service: string;
  service_rate: number;
  service_availability: DayOfWeek[];
  location: string[];
  caretaker: Caretaker;
}

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface Review {
    service_id: number;
    rating: number;
    review_description: string;
    user_id: number;
    anonymous: boolean;
    reviewer_name?: string;
  }

export default function ReviewPage() {
  const [service, setService] = useState<Service | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewDescription, setReviewDescription] = useState<string>('');
  const [anonymous, setAnonymous] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const caretakerId = parseInt(pathname.split('/')[3] || '0', 10);
  const serviceId = parseInt(pathname.split('/')[4] || '0', 10);

  const token = sessionStorage.getItem('access_token');
  const userId = sessionStorage.getItem('user_id');
  // sessionStorage.setItem('caretaker_id', String(caretakerId));  
  // sessionStorage.setItem('service_id', String(serviceId));  

  if (!token) {
    router.push('/signout/login');
    return;
  }

  useEffect(() => {
    const fetchCaretaker = async () => {

      try {
        const response = await axios.get<Service>(`http://localhost:8000/service/${caretakerId}/${serviceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setService(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching caretakers:', err);
        setService(null);
        setError('Failed to load caretakers');
        setLoading(false);
      }
    };

    fetchCaretaker();
  }, []);

  console.log('Service', service);

  if (service === null) {
    return <div className="text-red-500 text-center p-4">Service not found</div>;
  }

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


  const handleReview = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      console.log(rating)
      console.log(reviewDescription)
      console.log(anonymous)
        await axios.post(
            `http://localhost:8000/review/${serviceId}`,
            {
                rating: rating,
                review_description: reviewDescription,
                anonymous: anonymous,
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        router.push(`/search/caretaker/${caretakerId}/${serviceId}`);
    }
    catch (err) {
        console.error('Error posting review:', err);
    }
  };  

  

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="p-8 w-full max-w-lg">
        <div className="flex flex-col mb-8">
          <div className="flex items-center">
            <Link href={`/search/caretaker/${caretakerId}/${serviceId}`}>
              <div className="poppins text-orange-500 text-2xl mr-4">←</div>
            </Link>
            <Image src='/dog.png' alt={service.service} width={80} height={80} className="rounded-full mr-4" />
            <h1 className="jua text-3xl font-bold">Review {service.caretaker.name}</h1>
          </div>
        </div>
        <div className="mb-4 poppins">
          <p><strong>Service:</strong> {service.service.charAt(0).toUpperCase() + service.service.slice(1)}</p>
          <p><strong>Rates: $</strong>{service.service_rate}</p>
          <p><strong>Availability:</strong> {service.service_availability.join(', ')}</p>
          <p><strong>Location:</strong> {service.location.join(', ')}</p>
        </div>
        <form onSubmit={handleReview}>
        <div className="flex justify-center">
            <div className="flex flex-col w-full">
            <label className="poppins text-lg" htmlFor="rating">Rating</label>
            <input 
                type="number" 
                name="rating" 
                id="rating" 
                min="1" 
                max="5" 
                required 
                className="poppins border border-gray-300 rounded p-2" 
                value={rating || ''} 
                onChange={(e) => setRating(Number(e.target.value))}
            />
            </div>
        </div>
        <br />
        <div className="flex justify-center">
            <div className="flex flex-col w-full">
            <label className="poppins text-lg" htmlFor="review">Review</label>
            <textarea 
                name="review" 
                id="review" 
                required 
                className="poppins border border-gray-300 rounded p-2" 
                value={reviewDescription} 
                onChange={(e) => setReviewDescription(e.target.value)}
            ></textarea>
            </div>
        </div>
        <br />
        <div className="flex justify-center">
            <div className="flex w-full">
            <label className="poppins text-lg" htmlFor="anonymous">Post as Anonymous</label>
            <input 
                type="checkbox" 
                name="anonymous" 
                id="anonymous" 
                className="poppins border border-gray-300 rounded p-2 ml-8" 
                checked={anonymous} 
                onChange={(e) => setAnonymous(e.target.checked)}
            />
            </div>
        </div>
        <br />
        <button type="submit" className="poppins bg-orange-500 text-white px-4 py-2 rounded">Post Review</button>
        </form>
      </div>
    </div>
  );
}



/* const caretakers = [
  {
    id: 1,
    name: 'Caretaker 1',
    experience: '5 years',
    servicesOffered: [
      {
        name: 'Walking',
        availableTimeslots: ['14:00', '15:00', '16:00', '17:00'],
        rates: '$20/hour',
        reviews: [
          { reviewer: 'John Doe', comment: 'Great walking service!', rating: 5 },
          { reviewer: 'Jane Smith', comment: 'Very reliable walker.', rating: 4 },
        ],
      },
      {
        name: 'Grooming',
        availableTimeslots: ['13:00', '14:00', '15:00', '16:00', '17:00'],
        rates: '$25/hour',
        reviews: [
          { reviewer: 'Alice Brown', comment: 'Excellent grooming!', rating: 5 },
          { reviewer: 'Bob Johnson', comment: 'Very professional.', rating: 4 },
        ],
      },
    ],
    location: 'Location 1',
    imageUrl: '/dog.png',
    introduction: 'I am Caretaker 1, with 5 years of experience in pet care.',
  },
  {
    id: 2,
    name: 'Caretaker 2',
    experience: '3 years',
    servicesOffered: [
      {
        name: 'Walking',
        availableTimeslots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        rates: '$30/hour',
        reviews: [
          { reviewer: 'Alice Brown', comment: 'Excellent walking service!', rating: 5 },
          { reviewer: 'Bob Johnson', comment: 'Good with pets.', rating: 4 },
        ],
      },
      {
        name: 'Training',
        availableTimeslots: ['11:00', '12:00', '13:00', '14:00', '15:00'],
        rates: '$35/hour',
        reviews: [
          { reviewer: 'Charlie Davis', comment: 'Great trainer!', rating: 5 },
          { reviewer: 'Dana Evans', comment: 'Very effective training.', rating: 4 },
        ],
      },
    ],
    location: 'Location 2',
    imageUrl: '/dog.png',
    introduction: 'I am Caretaker 2, specializing in pet training.',
  },
  {
    id: 3,
    name: 'Caretaker 3',
    experience: '7 years',
    servicesOffered: [
      {
        name: 'Walking',
        availableTimeslots: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
        rates: '$25/hour',
        reviews: [
          { reviewer: 'Eve Foster', comment: 'Great walking service!', rating: 5 },
          { reviewer: 'Frank Green', comment: 'Very reliable walker.', rating: 4 },
        ],
      },
      {
        name: 'Sitting',
        availableTimeslots: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        rates: '$40/hour',
        reviews: [
          { reviewer: 'Grace Hill', comment: 'Excellent sitting service!', rating: 5 },
          { reviewer: 'Hank Ives', comment: 'Very professional sitter.', rating: 4 },
        ],
      },
    ],
    location: 'Location 3',
    imageUrl: '/dog.png',
    introduction: 'I am Caretaker 3, with 7 years of experience in pet care.',
  },
]; */