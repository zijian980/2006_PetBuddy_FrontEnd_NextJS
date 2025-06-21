'use client';

import { useState } from 'react';
import Link from 'next/link';

const Register = () => {
  // Form state variables with explicit types
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    specialChar: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  // Password validation function
  const validatePassword = (value: string) => {
    setPasswordValidation({
      length: /.{10,20}/.test(value), // Check length
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value), // Check for special char
      uppercase: /[A-Z]/.test(value), // Check for uppercase letter
      lowercase: /[a-z]/.test(value), // Check for lowercase letter
      number: /[0-9]/.test(value), // Check for number
    });
  };

  // Register handler
  const handleRegister = async () => {
    // Check if all fields are filled
    if (!username || !email || !password || !confirmPassword || !termsAccepted) {
      alert('Please fill in all fields and accept the terms and conditions');
      return;
    }

    // Check password validity
    const passwordRequirements = [
      {
        regex: /.{10,20}/,
        message: 'Password does not meet the requirements',
      },
      {
        regex: /[!@#$%^&*(),.?":{}|<>]/,
        message: 'Password does not meet the requirements',
      },
      {
        regex: /[A-Z]/,
        message: 'Password does not meet the requirements',
      },
      {
        regex: /[a-z]/,
        message: 'Password does not meet the requirements',
      },
      {
        regex: /[0-9]/,
        message: 'Password does not meet the requirements',
      },
    ];

    // Validate password against requirements
    for (let { regex, message } of passwordRequirements) {
      if (!regex.test(password)) {
        alert(message);
        return;
      }
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Attempt to register the user
    try {
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      // Handle failed response
      if (!response.ok) {
        
        const errorData = await response.json();
        if (response.status === 409) { 
          alert(errorData.detail); // Display error detail returned from backend
        } else {
          throw new Error(errorData.detail || 'Failed to register. Please try again.');
        }
      }
        
      // Handle successful registration
      const data = await response.json();
      console.log('User registered:', data);
      alert('Successfully registered!');
      window.location.href = '/signout/login'; // Redirect after registration
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Failed to register. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-white">
      <h1 className="jua text-4xl text-orange-500">PetBuddy</h1>
      <h2 className="jua text-4xl text-black-800 mt-4">Registration</h2>
      <p className="poppins text-xs text-black-600 mt-2">Enter your information</p>

      {/* Username input */}
      <div className="poppins w-full max-w-xs mt-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Username<span className="text-red-500">*</span></label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Email input */}
      <div className="poppins w-full max-w-xs mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Email<span className="text-red-500">*</span></label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Password input */}
      <div className="poppins w-full max-w-xs mt-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Password<span className="text-red-500">*</span></label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
        />
        <div className="mt-2 text-sm">
          {/* Password validation feedback */}
          <ul className="list-inside">
            <li className={`text-sm ${passwordValidation.length ? 'text-green-500' : 'text-red-500'}`}>
              Password must be between 10 and 20 characters
            </li>
            <li className={`text-sm ${passwordValidation.specialChar ? 'text-green-500' : 'text-red-500'}`}>
              Password must contain at least one special character
            </li>
            <li className={`text-sm ${passwordValidation.uppercase ? 'text-green-500' : 'text-red-500'}`}>
              Password must include at least one uppercase letter
            </li>
            <li className={`text-sm ${passwordValidation.lowercase ? 'text-green-500' : 'text-red-500'}`}>
              Password must include at least one lowercase letter
            </li>
            <li className={`text-sm ${passwordValidation.number ? 'text-green-500' : 'text-red-500'}`}>
              Password must include at least one number
            </li>
          </ul>
        </div>
      </div>

      {/* Confirm Password input */}
      <div className="poppins w-full max-w-xs mt-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password<span className="text-red-500">*</span></label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {/* Terms and conditions checkbox */}
      <div className="poppins flex items-center mt-4">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mr-2"
        />
        <p className="text-xs text-gray-700">
          I acknowledge that I have read the{' '}
          <span className="text-blue-500 underline cursor-pointer" onClick={toggleModal}>
            Terms and Conditions
          </span>.
        </p>
      </div>

      {/* Register button */}
      <button
        className="poppins bg-orange-500 text-white py-2 px-4 rounded mt-6"
        onClick={handleRegister}
      >
        Register
      </button>

      {/* Terms and Conditions Modal */}
      {isModalVisible && (
        <div className="poppins fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-5 w-11/12 max-w-lg">
            <h3 className="text-xl font-bold mb-3">Terms and Conditions</h3>
            <p className="text-base text-justify">This is the modal content.</p>
            <button
              className="mt-4 bg-orange-500 text-white py-2 px-4 rounded"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Login link */}
      <p className="poppins mt-4">
        Already have an account?{' '}
        <Link href="/signout/login" className="text-blue-500 underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Register;
