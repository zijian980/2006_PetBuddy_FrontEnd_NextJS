"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
}

interface Caretaker {
  name: string;
  dob: string;      
  gender: 'male' | 'female' | 'other';
  work_exp: number;
  service: Service[]; 
  user_id: number;
  user: User;
}

// Type for days of the week
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Type for service details
interface Service {
  service: string;
  service_rate: number;
  service_availability: DayOfWeek[];
  location: string[];
  caretaker: Caretaker;
}

export default function UpcomingEvents() {
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCaretakers = async () => {
      const token = sessionStorage.getItem('access_token');
      
      if (!token) {
        router.push('/signout/login');
        return;
      }

      try {
        const response = await axios.get<Caretaker[]>('http://localhost:8000/caretaker', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setCaretakers(response.data);

        const responseService = await axios.get<Service[]>('http://localhost:8000/service', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        setServices(responseService.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching caretakers:', err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError('Failed to load caretakers');
        setLoading(false);
      }
    };

    fetchCaretakers();
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

  console.log(caretakers);
  console.log(services);

  return (
    <div className="p-8">
      <div className="flex items-center justify-center mb-8">
        <h1 className="jua text-3xl font-bold text-center">Caretakers</h1>
      </div>
    <div className="space-y-8">
        {caretakers.map(caretaker => (
        <Link key={caretaker.user_id} href={`search/caretaker/${caretaker.user_id}`}>
            <div className="w-full cursor-pointer">
            <div className="border-t-4 border-orange-500"></div>
            <div className="flex items-center justify-left p-4">
                <Image
                src="/janedoe.png"
                alt={caretaker.name}
                width={64}
                height={64}
                className="rounded-full"
                />
                <div className="ml-4">
                <h2 className="poppins text-xl font-semibold">{caretaker.name}</h2>
                <p className="poppins text-gray-600">{`Gender: ${caretaker.gender}`}</p>             
                <p className="poppins text-gray-600">{`Experience: ${caretaker.work_exp}`}</p>
                <p className="poppins text-gray-600">{`Services: ${services.filter(s => s.caretaker.user.id === caretaker.user_id)?.length ? services.filter(s => s.caretaker.user.id === caretaker.user_id).map(s => s.service).join(', ') : 'No services available'}`}</p>
                </div>
            </div>
            <div className="border-t-3 border-orange-500"></div>
            </div>
        </Link>
        ))}
    </div>
    <Link href="search/map">
        <button className="fixed bottom-16 right-16 bg-orange-500 text-white p-4 rounded-full mb-16 shadow-lg">
        <FontAwesomeIcon
            icon={faMap}
        />
        </button>
    </Link>
    </div>
  );
}



/* const caretakers = [
  {
    id: 1,
    name: 'Caretaker 1',
    experience: '5 years',
    servicesOffered: ['Walking', 'Grooming'],
    availability: 'Weekdays',
    imageUrl: '/dog.png',
  },
  {
    id: 2,
    name: 'Caretaker 2',
    experience: '3 years',
    servicesOffered: ['Walking', 'Training'],
    availability: 'Weekends',
    imageUrl: '/dog.png',
  },
  {
    id: 3,
    name: 'Caretaker 3',
    experience: '7 years',
    servicesOffered: ['Walking', 'Sitting'],
    availability: 'Weekdays and Weekends',
    imageUrl: '/dog.png',
  },
]; */