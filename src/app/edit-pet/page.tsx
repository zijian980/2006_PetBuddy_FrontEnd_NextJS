"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface PetFormData {
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  pet_age: number;
  pet_health: string;
  pet_preferences: string | null;
}

interface PetResponse {
  pet_id: number;
  pet_name: string;
  pet_species: string;
  pet_breed: string;
  pet_age: number;
  pet_health: string;
  pet_preferences: string | null;
  petowner: any;
}

const EditPetProfile: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<PetFormData>({
    pet_name: '',
    pet_species: '',
    pet_breed: '',
    pet_age: 0,
    pet_health: '',
    pet_preferences: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');
      const pet_id = sessionStorage.getItem('pet_id');

      if (!token || !userId || !pet_id) {
        setError('Missing required data');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        const response = await axios.get<PetResponse>(
          `http://localhost:8000/pet/${userId}/${pet_id}`,
          config
        );
        
        const { pet_name, pet_species, pet_breed, pet_age, pet_health, pet_preferences } = response.data;
        setFormData({
          pet_name,
          pet_species,
          pet_breed,
          pet_age,
          pet_health: pet_health || 'Healthy',
          pet_preferences
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching pet:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            sessionStorage.clear();
            router.push('/login');
            return;
          }
          setError(err.response?.data?.detail || 'Failed to fetch pet profile');
        } else {
          setError('Failed to fetch pet profile');
        }
        setLoading(false);
      }
    };

    fetchPet();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pet_age' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    const token = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('user_id');
    const pet_id = sessionStorage.getItem('pet_id');

    if (!token || !userId || !pet_id) {
      setError('Missing required data');
      return;
    }

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    try {
      const response = await axios.put(
        `http://localhost:8000/pet/${userId}/${pet_id}`,
        formData,
        config
      );

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile-petOwner');
        }, 1500);
      }
    } catch (err) {
      console.error('Error updating pet:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/login');
          return;
        }
        setError(err.response?.data?.detail || 'Failed to update pet profile');
      } else {
        setError('Failed to update pet profile');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Pet Profile</h1>
        <button 
          onClick={() => router.push('/profile-petOwner')}
          className="text-gray-600"
        >
          ✕
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          Pet profile updated successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-24 h-24 mb-2">
          <Image
            src="/kimmydog.png"
            alt="Pet Picture"
            layout="fill"
            objectFit="cover"
            className="rounded-full border-2 border-[#FF6B3D]"
          />
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="pet_name" className="block text-gray-700 mb-2">
            Pet Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pet_name"
            name="pet_name"
            value={formData.pet_name}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="pet_species" className="block text-gray-700 mb-2">
            Pet Species<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pet_species"
            name="pet_species"
            value={formData.pet_species}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="pet_breed" className="block text-gray-700 mb-2">
            Pet Breed<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="pet_breed"
            name="pet_breed"
            value={formData.pet_breed}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="pet_age" className="block text-gray-700 mb-2">
            Pet Age (years)<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="pet_age"
            name="pet_age"
            value={formData.pet_age}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
            min="0"
            step="0.5"
          />
        </div>

        <div>
          <label htmlFor="pet_health" className="block text-gray-700 mb-2">
            Pet Health Status<span className="text-red-500"></span>
          </label>
          <textarea
            id="pet_health"
            name="pet_health"
            value={formData.pet_health}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
            rows={3}
            placeholder="Please describe any health conditions or special needs..."
          />
        </div>

        <div>
          <label htmlFor="pet_preferences" className="block text-gray-700 mb-2">
            Pet Preferences
          </label>
          <textarea
            id="pet_preferences"
            name="pet_preferences"
            value={formData.pet_preferences || ''}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            rows={3}
            placeholder="Any specific preferences for your pet..."
          />
        </div>

        <div className="flex space-x-4">
          <button 
            type="button" 
            onClick={() => router.push('/profile-petOwner')}
            className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="w-1/2 bg-[#FF6B3D] text-white py-3 rounded-lg font-semibold hover:bg-[#e85d2f] transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditPetProfile;