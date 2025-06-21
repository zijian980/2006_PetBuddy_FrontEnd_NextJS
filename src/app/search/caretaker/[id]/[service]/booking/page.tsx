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
import moment from 'moment-timezone';

// Type for days of the week
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Type for service details
interface Service {
  service_id: number;
  service: string;
  service_rate: number;
  service_availability: DayOfWeek[];
  location: string[];
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
  const [selectedTimeslots, setSelectedTimeslots] = useState<Date[]>([]);

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

        // console.log(responseCalendar.data);
        if (responseCalendar.data != null)
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

  if (serviceBooking == null) {
    return <div className="text-red-500 text-center p-4">Service not found</div>;
  }

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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const dateInSingapore = moment(date).tz("Asia/Singapore").toDate(); // Convert to Singapore time
      setSelectedTimeslots(prev => [...prev, dateInSingapore]);
    }
  };

  const handleTimeslotCancel = (index: number) => {
    setSelectedTimeslots(prev => prev.filter((_, i) => i !== index));
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

  const handleSaveAndProceedToPayment = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!selectedPet || !selectedLocation || selectedTimeslots.length === 0) {
      alert('Please select a pet, location, and at least one timeslot');
      return;
    }
    else {
      const dataToSave = {
        caretakerId: caretakerId,
        serviceId: serviceId,
        serviceType: serviceBooking.service.charAt(0).toUpperCase() + serviceBooking.service.slice(1),
        location: selectedLocation, // Assuming location is a property of caretaker
        petName: selectedPet, // Assuming selectedPet is a state variable
        petId: ownerPets.find(pet => pet.pet_name === selectedPet)?.pet_id,
        timeslots: selectedTimeslots,
        serviceRate: serviceBooking.service_rate
      };
    
      sessionStorage.setItem('bookingData', JSON.stringify(dataToSave));
      router.push(`/search/caretaker/${caretakerId}/${serviceId}/booking/payment`);
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
            <Image src='/dog.png' alt={serviceBooking.service} width={80} height={80} className="rounded-full mr-4" />
            <h1 className="jua text-3xl font-bold">{serviceBooking.service}</h1>
          </div>
        </div>
        <div className="mb-4 poppins">
          <p><strong>Service:</strong> {serviceBooking.service.charAt(0).toUpperCase() + serviceBooking.service.slice(1)}</p>
          <p><strong>Rates: $</strong>{serviceBooking.service_rate}</p>
          <p><strong>Availability:</strong> {serviceBooking.service_availability.join(', ')}</p>
        </div>
        <form onSubmit={handleSaveAndProceedToPayment}>
        <div className="mb-4 poppins">
          <label htmlFor="pet" className="block text-lg font-medium text-gray-700">Choose Pet</label>
          <select
            id="pet"
            name="pet"
            value={selectedPet}
            onChange={handlePetChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a pet</option>
            {ownerPets.map(pet => (
              <option key={pet.pet_id} value={pet.pet_name}>{pet.pet_name}</option>
            ))}
          </select>
        </div>
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
          <div className="flex items-center space-x-4">
            <div className="flex-1 border rounded-lg p-2 bg-white">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                showTimeSelect
                filterTime={filterTimes}
                filterDate={filterDates}
                dateFormat="Pp"
                className="w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                timeZone="Asia/Singapore"
              />
            </div>
            <button
              type="button" 
              onClick={() => handleDateChange(selectedDate)}
              className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Timeslot
            </button>
          </div>
        </div>
        <div className="mb-8 poppins">
          <h3 className="text-lg font-medium text-gray-700">Selected Timeslots:</h3>
          {selectedTimeslots.map((timeslot, index) => (
            <div key={index} className="flex justify-between items-center">
              <p>{moment(timeslot).tz("Asia/Singapore").format("YYYY-MM-DD HH:mm")}</p>
              <button
                type="button"
                onClick={() => handleTimeslotCancel(index)}
                className="text-red-500 hover:text-red-700"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button type="submit" className="poppins bg-orange-500 text-white px-4 py-2 rounded">Book Now</button>
        </div>
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