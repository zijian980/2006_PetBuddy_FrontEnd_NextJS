"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';

const EditProfilePicture = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentPicture, setCurrentPicture] = useState<string>('/johndoe.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'petowner' | 'caretaker' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Determine user type and fetch current profile picture
    const fetchCurrentPicture = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');
      const profileType = sessionStorage.getItem('profile_type');

      if (!token || !userId) {
        router.push('/login');
        return;
      }

      setUserType(profileType === '2' ? 'caretaker' : 'petowner');

      try {
        // Try to fetch current profile picture
        const response = await axios.get(
          `http://localhost:8000/users/${userId}/profile-picture`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            responseType: 'blob'
          }
        );

        const imageUrl = URL.createObjectURL(response.data);
        setCurrentPicture(imageUrl);
        
      } catch (err) {
        console.log('No current profile picture or error fetching it');
        // Keep default picture if there's an error
      }
    };

    fetchCurrentPicture();
  }, [router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const token = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('user_id');

    if (!token || !userId) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.put(
        `http://localhost:8000/users/${userId}/upload-profile-picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Redirect back to profile page
      router.push(userType === 'caretaker' ? '/profile-caretaker' : '/profile-petOwner');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex items-center mb-6">
        <Link 
          href={userType === 'caretaker' ? '/profile-caretaker' : '/profile-petOwner'} 
          className="text-orange-500 mr-4"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold">Edit Profile Picture</h1>
      </div>
  
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-orange-500">
            <Image
              src={previewUrl || currentPicture}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
  
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
  
          <button
            onClick={triggerFileInput}
            className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            type="button"
          >
            Select New Picture
          </button>
  
          {error && (
            <p className="text-red-500 text-center">{error}</p>
          )}
  
          <button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
            className={`bg-[#FF6B3D] text-white py-3 px-10 rounded-lg font-semibold
              ${!selectedFile || loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e85d2f]'}
              transition-colors`}
          >
            {loading ? 'Uploading...' : 'Upload Picture'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePicture;