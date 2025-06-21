'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import router from 'next/router';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { time } from 'console';

// Type for days of the week
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Type for service details
interface Service {
  service_id: number;
  service: string;
  service_rate: number;
  service_availability: DayOfWeek[];
  location: string[];
  caretaker: Caretaker;
}

interface Caretaker {
  name: string;
  dob: string;      
  gender: 'male' | 'female' | 'other';
  work_exp: number;
  service: Service[]; 
  user_id: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface Pet {
  pet_id: number;
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  pet_age: number;
  pet_health: string;
  pet_preferences: string | null;
  petowner: any;
}

interface PetOwner {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  location: string;
  user: User;
  pet: Pet[];
}

interface Timeslot {
  start: string;
  end: string;
  location: string;
  summary: string;
  status: string;
}

export default function BookingPage() {
  const [serviceBooking, setService] = useState<Service | null>(null);
  const [takenTimeslots, setTakenTimeslots] = useState<Timeslot[]>([]);
  const [ownerPets, setOwnerPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialDate = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [successEdit, setSuccessEdit] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();
  const caretakerId = parseInt(pathname.split('/')[3] || '0', 10);
  const serviceId = parseInt(pathname.split('/')[4] || '0', 10);

  const token = sessionStorage.getItem('access_token');
  const userId = sessionStorage.getItem('user_id');

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

        const responsePets = await axios.get<PetOwner>(`http://localhost:8000/petowner/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(responsePets.data);
        setOwnerPets(responsePets.data.pet);

        const responseCalendar = await axios.get<Timeslot[]>(`http://localhost:8000/calendar/${caretakerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log(responseCalendar.data);
        setTakenTimeslots(responseCalendar.data.events);

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

  if (serviceBooking === null) {
    return <div className="text-red-500 text-center p-4">Service not found</div>;
  }

  console.log('Service', serviceBooking);
  console.log('Pets', ownerPets);
  console.log('Times', takenTimeslots);

  /* useEffect(() => {
    if (serviceBooking) {
      const updateSelectedDate = () => {
        const [hours, minutes] = serviceBooking.service_availability[0].split(':').map(Number);
        const newDate = new Date(initialDate);
        newDate.setHours(hours, minutes, 0, 0);
        setSelectedDate(newDate);
      };

      updateSelectedDate();
    }
  }, [serviceBooking, initialDate]); */

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


  const handlePetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPet(event.target.value);
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(event.target.value);
  };

  const filterTimes = (time: Date) => {
    return !takenTimeslots.some(slot => {
      const start = new Date(slot.start);
      const end = new Date(slot.end);
      return time >= start && time <= end;
    });
  };
  const filterDates = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
    const isAvailableDay = serviceBooking.service_availability.includes(dayOfWeek);
    const isFutureDate = date >= new Date();
    return isAvailableDay && isFutureDate;
  };

  const handleEditBooking = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      if (!selectedDate) {
        setError('Please select a date and time');
        return;
      }
      const endDate = new Date(selectedDate);
      endDate.setTime(endDate.getTime() + 30 * 60000);
      const formattedStartDate = selectedDate.toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T');
      const formattedEndDate = endDate.toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T');
      console.log(formattedStartDate);
      console.log(selectedLocation);
      console.log(formattedEndDate);

      const response = await axios.put(
        `http://localhost:8000/calendar/${caretakerId}/${serviceId}/${parseInt(JSON.parse(sessionStorage.getItem("editBookingPet") || '{}').petId, 10)}`,
        {
          end_time: formattedEndDate,
          location: selectedLocation,
          start_time: formattedStartDate,
        },
        {
          headers: {
        'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setSuccessEdit(true);
        setTimeout(() => {
          router.push('/upcoming-bookings');
        }, 1000);
      }
    }
    catch (err) {
      console.error('Error editing booking:', err);
      setError('Failed to edit booking');
    }
  };  

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 w-full max-w-lg">
        <div className="flex items-center mb-8">
          <Image src='/dog.png' alt={serviceBooking.service} width={180} height={180} className="rounded-full mr-4" />
          <div className="ml-4">
            <h1 className="jua text-3xl font-bold">(Editing) {serviceBooking.service}</h1>
            <Link href={`/upcoming-bookings`}>
              <div className="poppins text-orange-500 text-xl mb-4">← Back</div>
            </Link>
          </div>
        </div>
        <div className="mb-4 poppins">
          <p><strong>Caretaker:</strong> {serviceBooking.caretaker.name}</p>
          <p><strong>Pet:</strong> {JSON.parse(sessionStorage.getItem("editBookingPet") || '{}').petName}</p>
          <p><strong>Availability:</strong> {serviceBooking.service_availability.join(', ')}</p>
          <p><strong>Original Timeslot:</strong> {format(new Date(JSON.parse(sessionStorage.getItem("editBookingPet") || '{}').start), 'PPpp')}</p>
          <p><strong>Original Location:</strong> {JSON.parse(sessionStorage.getItem("editBookingPet") || '{}').location}</p>
        </div>
        <form onSubmit={handleEditBooking}>
        <div className="mb-4 poppins">
          <label htmlFor="location" className="block text-lg font-medium text-gray-700">Choose Location</label>
          <select
            id="pet"
            name="pet"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Choose Location</option>
            {serviceBooking.location.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <div className="mb-8 poppins">
          <label htmlFor="date" className="block text-lg font-medium text-gray-700">Choose Date and Time</label>
            <div className="flex items-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              showTimeSelect
              filterTime={filterTimes}
              filterDate={filterDates}
              dateFormat="Pp"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
            </div>
        </div>
        <div className="flex justify-center">
          <button type="submit" className="poppins bg-orange-500 text-white px-4 py-2 rounded">Book Now</button>
        </div>
        </form>
        {successEdit && <div className="poppins text-green-500 text-center mt-4">Booking edited successfully! Redirecting...</div>}
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