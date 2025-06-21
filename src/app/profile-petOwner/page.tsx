"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Types for user data
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
}

interface Profile {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  location: string;
  user: User;
  pet: Pet[];
}

const ProfileCard: React.FC<{
  name: string;
  email: string;
  username: string;
  imgUrl: string;
}> = ({ name, email, username, imgUrl }) => (
  <div className="bg-orange-50 rounded-lg p-4 mb-6 flex justify-between items-center">
    <div>
      <h2 className="jua text-xl font-bold mb-1">Welcome, {name}!</h2>
      <p className="poppins text-sm text-gray-600">{email}</p>
      <p className="poppins text-sm text-gray-600">{username}</p>
      <Link href="/editprofile-petOwner" className="poppins text-orange-400 text-sm">Edit profile &gt;</Link>
    </div>
    <Image src={imgUrl} alt={name} width={60} height={60} className="rounded-full object-cover w-[60px] h-[60px]" />
  </div>
);

const PetCard: React.FC<{
  pet: Pet;
  imgUrl: string;
}> = ({ pet, imgUrl }) => {
  const handleEditClick = () => {
    console.log('Setting pet_id:', pet.pet_id); // Debug log
    sessionStorage.setItem('pet_id', pet.pet_id.toString());
  };

  return (
    <div className="poppins bg-orange-50 rounded-lg p-4 w-[280px] flex items-center">
      <Image src={imgUrl} alt={pet.pet_name} width={60} height={60} className="rounded-lg mr-4" />
      <div>
        <h3 className="font-bold">{pet.pet_name}</h3>
        <p className="text-sm text-gray-600">{pet.pet_age} Years</p>
        <Link 
          href="/edit-pet" 
          className="text-orange-400 text-sm"
          onClick={handleEditClick}
        >
          Edit pet profile &gt;
        </Link>
      </div>
    </div>
  );
};

const AddPetButton = () => (
  <button className="bg-orange-300 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl">+</button>
);

const GeneralItem: React.FC<{
  text: string;
  link: string;
  onClick?: () => void;
  isDelete?: boolean;
}> = ({ text, link, isDelete = false }) => (
  <Link href={link} className={`py-4 flex justify-between items-center border-b ${isDelete ? 'text-red-500' : ''}`}>
    {text}
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string>('/johndoe.png');
  const router = useRouter();

  const fetchProfilePicture = async (userId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/users/${userId}/profile-picture`,
        {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('access_token')}` },
          responseType: 'blob'
        }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setProfilePicture(imageUrl);
    } catch (err) {
      console.log('Using default profile picture');
      setProfilePicture('/johndoe.png');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');

      if (!token || !userId) {
        router.push('/signout/login');
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        setLoading(true);
        // Fetch profile data
        const profileResponse = await axios.get<Profile>(
          `http://localhost:8000/petowner/${userId}`, 
          config
        );

        if (profileResponse.data) {
          console.log('Profile data received:', profileResponse.data);
          setProfile(profileResponse.data);
        } else {
          throw new Error('No profile data received');
        }

        // Fetch profile picture
        await fetchProfilePicture(userId);

        setPets(profileResponse.data.pet || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setProfile(null);
        setPets([]);
        if (err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
        }
        setError(err.response?.data?.detail || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

    // Cleanup useEffect for profile picture
    useEffect(() => {
      return () => {
        if (profilePicture && profilePicture !== '/johndoe.png') {
          URL.revokeObjectURL(profilePicture);
        }
      };
    }, [profilePicture]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="poppins bg-white h-full pb-20">
      <main className="p-4">
        <h2 className="jua text-2xl font-bold mb-4">Profile</h2>
        <ProfileCard 
          name={profile?.name || "Loading..."} 
          email={profile?.user.email || "Loading..."} 
          username={`@${profile?.user.username || "loading"}`} 
          imgUrl={profilePicture}
        />
        
        <h2 className="jua text-2xl font-bold mb-4">My Pets</h2>
        <div className="relative">
          <div className="flex overflow-x-auto pb-4 scrollbar-hide space-x-4">
          {pets.map((pet) => (
          <div key={pet.pet_id} className="flex-shrink-0">
            <PetCard 
              pet={pet}
              imgUrl="/kimmydog.png" 
            />
          </div>
        ))}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/signout/signup/createProfile/petOwnerProfile/addPet">
                <AddPetButton />
              </Link>
            </div>
          </div>
        </div>
        
        <h2 className="jua text-2xl font-bold mb-4">General</h2>
        <div className="bg-white">
          <GeneralItem text="Logout" link="/signout/login" onClick={() => sessionStorage.clear()} />
          <GeneralItem text="Booking History" link="/booking-history" />
          <GeneralItem text="Payment History" link="/payment-history" />
          <GeneralItem text="Change Password" link="/change-password" />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;