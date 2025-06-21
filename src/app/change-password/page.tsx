"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePassword: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const getProfilePath = () => {
    const profileType = Number(sessionStorage.getItem('profile_type'));
    return profileType === 2 ? '/profile-caretaker' : '/profile-petOwner';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
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
      },
      params: {
        new_password: formData.newPassword
      }
    };

    try {
      // Send only the new password as a query parameter
      const response = await axios.put(
        `http://localhost:8000/users/${userId}/change-password`,
        null,
        config
      );

      if (response.status === 200) {
        setSuccess(true);
        // Clear sensitive data
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          router.push(getProfilePath());
        }, 1500);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          sessionStorage.clear();
          router.push('/login');
          return;
        }
        setError(err.response.data.detail || 'Failed to change password');
      } else {
        setError('Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const profilePath = getProfilePath();

  return (
    <main className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
        <button 
          onClick={() => router.push(profilePath)}
          className="text-gray-600"
        >
          ✕
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          Password changed successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="currentPassword" className="block text-gray-700 mb-2">
            Current Password<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-gray-700 mb-2">
            New Password<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
            Confirm New Password<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 border border-[#FF6B3D] rounded-lg"
            required
            minLength={6}
          />
        </div>

        <div className="flex space-x-4">
          <button 
            type="button" 
            onClick={() => router.push(profilePath)}
            className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-1/2 bg-[#FF6B3D] text-white py-3 rounded-lg font-semibold 
              ${!loading ? 'hover:bg-[#e85d2f]' : 'opacity-70 cursor-not-allowed'} 
              transition-colors`}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default ChangePassword;