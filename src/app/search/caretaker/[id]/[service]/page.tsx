'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

interface Caretaker {
  name: string;
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

interface Review {
  rating: number;
  review_description: string;
  user_id: number;
  anonymous: boolean;
  reviewer_name?: string;
  service: Service;
}

export default function EventDetails() {
  const [caretaker, setCaretaker] = useState<Caretaker | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const caretakerId = parseInt(pathname.split('/')[3] || '0', 10);
  const serviceId = pathname.split('/')[4];

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      router.push('/signout/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch caretaker and service data first
        const [responseCare, responseService] = await Promise.all([
          axios.get<Caretaker>(
            `http://localhost:8000/caretaker/${caretakerId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          ),
          axios.get<Service>(
            `http://localhost:8000/service/${caretakerId}/${serviceId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          )
        ]);

        setCaretaker(responseCare.data);
        setService(responseService.data);

        // Then fetch reviews
        try {
          const responseReview = await axios.get<Review[]>(
            `http://localhost:8000/review/${serviceId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          console.log(responseReview)

          if (responseReview.data && responseReview.data.length > 0) {
            // Only fetch petowner details if we have reviews
            const reviewsWithNames = await Promise.all(
              responseReview.data.map(async (review) => {
                try {
                  console.log('Review:', review);
                  const petownerResponse = await axios.get(
                    `http://localhost:8000/petowner/${review.user_id}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  );
                  return {
                    ...review,
                    reviewer_name: petownerResponse.data.name
                  };
                } catch (err) {
                  return {
                    ...review,
                    reviewer_name: 'Unknown User'
                  };
                }
              })
            );
            setReviews(reviewsWithNames);
          }
        } catch (reviewErr) {
          console.error('Error fetching reviews:', reviewErr);
          // Don't set error state, just keep reviews empty
          setReviews([]);
        }
      } catch (err) {
        console.error('Error fetching service data:', err);
        setError('Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [caretakerId, serviceId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  if (error || !caretaker || !service) {
    return <div className="text-red-500 text-center p-4">Service not found</div>;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  return (
    <div className="p-8 justify-center items-center min-h-screen">
      <div className="flex items-center">
        <Link href={`/search/caretaker/${caretakerId}`}>
          <div className="text-orange-500 text-3xl mr-8 inline-block">←</div>
        </Link>
        <Image src='/janedoe.png' alt={service.service} width={90} height={90} className="rounded-full" />
        <div className="ml-4">
          <h1 className="jua text-3xl font-bold">{caretaker.name}</h1>
        </div>
      </div>
      <div className="mt-4 poppins">
        <p className="jua bg-orange-100 p-4 rounded-lg text-xl">
          {service.service.charAt(0).toUpperCase() + service.service.slice(1)}
          <p className="poppins text-lg">{'⭐'.repeat(Math.round(averageRating))} ({averageRating.toFixed(1)})</p>
        </p>
        <p className="mt-2">Availability: {service.service_availability.join(', ')}</p>
        <p className="mt-2">Rates: ${service.service_rate}</p>
        <p className="mt-2">Location: {service.location.join(', ')}</p>
      </div>
      <Link href={`/search/caretaker/${caretakerId}/${serviceId}/booking`}>
        <button className="poppins bg-orange-500 text-white px-4 py-2 rounded mt-8">
          Book Now
        </button>
      </Link>
      <div className="mt-8 poppins">
        <h2 className="text-xl font-bold">Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index}>
              <div className="mt-4">
          <p className="font-semibold">
            {review.anonymous ? 'Anonymous' : review.reviewer_name}
          </p>
          <p>{review.review_description}</p>
          <p>{'⭐'.repeat(review.rating)}</p>
          {review.user_id === parseInt(sessionStorage.getItem('user_id') || '0', 10) && (
            <Link href={`/search/caretaker/${caretakerId}/${serviceId}/editReview`}>
              <div className="text-blue-500">Edit Review</div>
            </Link>
          )}
              </div>
              {index < reviews.length - 1 && <hr className="my-4 border-gray-300" />}
            </div>
          ))
        ) : (
          <p className="mt-4 text-gray-500">No reviews yet</p>
        )}
      </div>
      <Link href={`/search/caretaker/${caretakerId}/${serviceId}/review`}>
        <button className="poppins bg-orange-500 text-white px-4 py-2 rounded mt-8">
          Create Review
        </button>
      </Link>
    </div>
  );
}