"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface ProfileFormData {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'prefer not to say';
  work_exp: number;
}

interface ProfileResponse {
  name: string;
  dob: string;
  gender: 'male' | 'female' | 'prefer not to say';
  work_exp: number;
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
  };
}

const EditProfile: React.FC = () => {
  const [profilePicture, setProfilePicture] = useState<string>('/johndoe.png');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    dob: '',
    gender: 'male',
    work_exp: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);
  const [workExpError, setWorkExpError] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);  // To track form validity

  const router = useRouter();

  // Fetch profile picture
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
          `http://localhost:8000/caretaker/${userId}`,
          config
        );
        const profileData = response.data;
        const formattedDate = new Date(profileData.dob).toISOString().split('T')[0];

        setFormData({
          name: profileData.name,
          dob: formattedDate,
          gender: profileData.gender,
          work_exp: Number(profileData.work_exp)
        });

        setUsername(profileData.user.username);
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

  const handleInputChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });

    let isFormValid = true;

    // Validate name
    if (key === 'name') {
      if (value.trim().length < 3 || value.trim().length > 30) {
        setNameError('Name must be between 3 and 30 characters.');
        isFormValid = false;
      } else {
        setNameError('');
      }
    }

    // Validate dob
    if (key === 'dob') {
      if (!value) {
        setDobError('Date of birth is required.');
        isFormValid = false;
      } else {
        setDobError('');
      }
    }

    // Validate work experience
    if (key === 'work_exp') {
      const workExp = Number(value);
      if (workExp < 0) {
        setWorkExpError('Work experience must be a positive number.');
        isFormValid = false;
      } else {
        setWorkExpError('');
      }
    }

    setFormValid(isFormValid);
  };

  const today = new Date();
  today.setFullYear(today.getFullYear() - 16); // Subtract 16 years
  const maxDate = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form before submission
    if (!formValid) {
      setError('Please fix the errors before submitting.');
      return;
    }

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
      const formattedData = {
        ...formData,
        dob: new Date(formData.dob).toISOString().split('T')[0],
        work_exp: Number(formData.work_exp)
      };

      const response = await axios.put(
        `http://localhost:8000/caretaker/${userId}`,
        formattedData,
        config
      );

      if (response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile-caretaker');
        }, 1000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          sessionStorage.clear();
          router.push('/login');
          return;
        }
        setError(err.response.data.detail || 'Failed to update profile');
      } else {
        setError('Failed to update profile');
      }
    }
  };

  useEffect(() => {
    // Validate form after fetching data
    const isFormValid =
      formData.name.trim().length >= 3 && formData.name.trim().length <= 30 &&
      formData.dob !== '' &&
      formData.work_exp >= 0;

    setFormValid(isFormValid);
  }, [formData]);

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

      <form className="space-y-6" onSubmit={handleChange}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-lg font-bold mb-2">Name<span className="text-red-500">*</span></label>
          <input
              className="w-full p-2 border border-orange-500 rounded"
              placeholder="Your name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>

        <div>
          <label htmlFor="dob" className="block text-gray-700 mb-2">
            Date of Birth<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            className="w-full p-2 border border-orange-500 rounded"
            value={formData.dob}
            onChange={(e) => handleInputChange('dob', e.target.value)}
            max={maxDate} // Set maximum date to 16 years ago
          />
          {dobError && <p className="text-red-500 text-sm">{dobError}</p>}
        </div>

        {/* Work Experience */}
        <div>
          <label htmlFor="work_exp" className="block text-gray-700 mb-2">Work Experience (years)<span className="text-red-500">*</span></label>
          <input
            type="number"
            id="work_exp"
            name="work_exp"
            className="w-full p-2 border border-orange-500 rounded"
            value={formData.work_exp}
            onChange={(e) => handleInputChange('work_exp', e.target.value)}
            min="0"
            step="1"
            max={
              formData.dob
                ? new Date().getFullYear() - new Date(formData.dob).getFullYear() -
                  (new Date() < new Date(new Date(formData.dob).setFullYear(new Date().getFullYear())) ? 1 : 0)
                : ''
            }
          />
          {workExpError && <p className="text-red-500 text-sm">{workExpError}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formValid}
          className={`w-full p-3 rounded bg-[#FF6B3D] text-white font-semibold ${!formValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Save Changes
        </button>
      </form>
    </main>
  );
};

export default EditProfile;
