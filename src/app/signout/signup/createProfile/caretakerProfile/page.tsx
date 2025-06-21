'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Gender = {
    female: "female",
    male: "male",
    prefer_not_to_say: "prefer not to say"
};

const CaretakerProfile = () => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        experience: '',
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [nameError, setNameError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const requiredFieldsFilled =
            formData.name.trim() !== '' &&
            formData.dob.trim() !== '' &&
            formData.gender.trim() !== '' &&
            formData.experience.trim() !== '';
        setIsFormValid(requiredFieldsFilled && !errorMessage && !nameError);
    }, [formData, errorMessage, nameError]);

    const handleInputChange = (key: string, value: string) => {
        setFormData((prevData) => ({ ...prevData, [key]: value }));

        if (key === 'name') {
            setNameError(value.trim().length < 3 || value.trim().length > 30
                ? 'Name must be between 3 and 30 characters.'
                : ''
            );
        }

        if (key === 'experience') {
            const workExp = parseFloat(value);
            const age = getAge(formData.dob);
            setErrorMessage(
                isNaN(workExp) || workExp < 0
                    ? 'Work experience must be a positive number.'
                    : workExp > age
                    ? 'Work experience cannot be greater than your age.'
                    : ''
            );
        }
    };

    const getAge = (dob: string) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const month = today.getMonth() - birthDate.getMonth();
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const today = new Date();
    today.setFullYear(today.getFullYear() - 16);
    const maxDate = today.toISOString().split('T')[0];

    const handleSubmit = async () => {
        if (isFormValid) {
            try {
                const accessToken = sessionStorage.getItem('access_token');
                const userId = sessionStorage.getItem('user_id');

                const response = await fetch('http://localhost:8000/caretaker', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        dob: formData.dob,
                        gender: formData.gender,
                        work_exp: parseFloat(formData.experience),
                        user_id: userId,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to create caretaker profile');
                }

                alert('Profile saved successfully!');
                //router.push('/profile');
            } catch (error) {
                alert((error as Error).message);
            }
        } else {
            alert('Please fill out all required fields and fix errors before submitting.');
        }
    };

    return (
        <div className="flex flex-col items-center p-5 bg-white min-h-screen">
            {/* Back Arrow */}
            <div className="absolute top-4 left-4">
                <Link href="/homepage">
                    <Image src="/back_arrow.png" alt="Back to homepage" width={24} height={24} />
                </Link>
            </div>

            {/* Titles */}
            <h2 className="jua text-4xl font-bold text-black text-center my-4">Create Profile</h2>
            <h3 className="jua text-2xl font-bold text-orange-500 text-center mb-5">Caretaker</h3>

            {/* Form Section */}
            <div className="poppins w-full max-w-md">
                <div className="mb-4">
                    <label className="block text-lg font-bold mb-2">Name<span className="text-red-500">*</span></label>
                    <input
                        className="w-full p-2 border border-orange-500 rounded"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-bold mb-2">Date of Birth<span className="text-red-500">*</span></label>
                    <input
                        type="date"
                        className="w-full p-2 border border-orange-500 rounded"
                        placeholder="YYYY-MM-DD"
                        value={formData.dob}
                        onChange={(e) => handleInputChange('dob', e.target.value)}
                        max={maxDate}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-bold mb-2">Gender<span className="text-red-500">*</span></label>
                    <select
                        className="w-full p-2 border border-orange-500 rounded"
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        {Object.entries(Gender).map(([key, value]) => (
                            <option key={key} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-bold mb-2">Work Experience<span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full p-2 border border-orange-500 rounded"
                        placeholder="Years of experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                    />
                    {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                </div>
            </div>

            {/* Save Button */}
            <button
                className={`poppins py-2 px-4 rounded mt-4 ${isFormValid ? 'bg-orange-500 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                onClick={handleSubmit}
                disabled={!!errorMessage || !isFormValid}
            >
                Submit
            </button>

            {/* Decorative Image */}
            <Image src="/line1.png" alt="White Puppy" width={160} height={180} className="my-5" />

            {/* Add Service Button */}
            <div className="flex flex-col items-center mt-10">
                <Link href="/signout/signup/createProfile/caretakerProfile/addService" className="flex items-center justify-center w-16 h-16 rounded-full">
                    <Image src="/addIcon.png" alt="White Puppy" width={160} height={160} className="my-5" />
                </Link>
                <p className="poppins text-lg text-gray-500 mt-2">Start adding your services!</p>
            </div>
        </div>
    );
};

export default CaretakerProfile;
