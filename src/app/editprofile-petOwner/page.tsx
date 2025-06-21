"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Interface for form data
interface ProfileFormData {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'prefer not to say';
  location: string;
}

// Interface for API response
interface ProfileResponse {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'prefer not to say';
  location: string;
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
  };
}

const EditProfile: React.FC = () => {
  const [profilePicture, setProfilePicture] = useState<string>('/johndoe.png');

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

  const router = useRouter();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    dob: '',
    gender: 'male',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [isFormValid, setIsFormValid] = useState(false);  // Track form validity

  useEffect(() => {
    const fetchProfile = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');

      if (!token || !userId) {
        router.push('/login');
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
        const response = await axios.get<ProfileResponse>(
          `http://localhost:8000/petowner/${userId}`,
          config
        );
        const profileData = response.data;

        const formattedDate = new Date(profileData.dob).toISOString().split('T')[0];

        setFormData({
          name: profileData.name,
          dob: formattedDate,
          gender: profileData.gender,
          location: profileData.location
        });

        setUsername(profileData.user.username);
        // Fetch profile picture
        await fetchProfilePicture(userId);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401) {
          sessionStorage.clear();
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      // Validate name length
      if (value.length < 3 || value.length > 30) {
        setFormErrors((prev) => ({
          ...prev,
          name: 'Name must be between 3 and 30 characters'
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          name: ''
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const today = new Date();
  today.setFullYear(today.getFullYear() - 16); // Subtract 16 years
  const maxDate = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Check if there are any form errors before submitting
    if (formErrors.name) {
      return;
    }

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
      const formattedData = {
        name: formData.name,
        dob: new Date(formData.dob).toISOString().split('T')[0],
        gender: formData.gender,
        location: formData.location
      };

      const response = await axios.put(
        `http://localhost:8000/petowner/${userId}`,
        formattedData,
        config
      );

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile-petOwner');
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          sessionStorage.clear();
          router.push('/signout/login');
          return;
        }
        setError(err.response.data.detail || 'Failed to update profile');
      } else {
        setError('Failed to update profile');
      }
    }
  };

  // Check form validity
  useEffect(() => {
    const isValid = !formErrors.name && formData.name.length >= 3 && formData.name.length <= 30;
    setIsFormValid(isValid);
  }, [formData, formErrors]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          Profile updated successfully! Redirecting...
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
            src={profilePicture}
            alt="Profile Picture"
            layout="fill"
            objectFit="cover"
            className="rounded-full border-2 border-[#FF6B3D]"
          />
        </div>
        <Link href="/edit-profile-picture" className="text-blue-500">
          Edit profile picture
        </Link>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-gray-700 mb-2">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
          {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="dob" className="block text-gray-700 mb-2">
            Date of Birth<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            max={maxDate}
            value={formData.dob}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-gray-700 mb-2">
            Gender<span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-gray-700 mb-2">
            Location<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className={`w-full p-3 rounded bg-[#FF6B3D] text-white font-semibold ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditProfile;
