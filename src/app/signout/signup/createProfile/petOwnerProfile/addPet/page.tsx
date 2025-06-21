'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AddServiceProfile = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        petName: '',
        species: '',
        breed: '',
        age: '',
        healthConditions: '',
        preferences: '',
    });

    const [image, setImage] = useState<string | null>(null); // State to store the selected image
    const [isFormValid, setIsFormValid] = useState(false);

    const handleInputChange = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });
    };

    useEffect(() => {
        // Ensure that the required fields are filled in
        const requiredFieldsFilled =
            formData.petName !== '' &&
            formData.species !== '' &&
            formData.breed !== '' &&
            formData.age !== '' &&
            formData.healthConditions !== '';
        setIsFormValid(requiredFieldsFilled);
    }, [formData]);

    const handleSubmit = async () => {
        if (isFormValid) {
            try {
                // Retrieve the access token and user ID from sessionStorage
                const access_token = sessionStorage.getItem('access_token');
                const user_id = sessionStorage.getItem('user_id');

                // Check if accessToken or userId is null
                if (!access_token || !user_id) {
                    alert("Error: Access token or user ID is missing. Please log in again.");
                    return;
                }

                // Convert age to a float (as backend expects a float for pet_age)
                const dataToSend = {
                    pet_name: formData.petName,
                    pet_species: formData.species,
                    pet_breed: formData.breed,
                    pet_age: parseFloat(formData.age), // Convert age to float
                    pet_health: formData.healthConditions || 'Healthy', // Default to 'Healthy' if empty
                    pet_preferences: formData.preferences || null, // Default to null if empty
                };

                // Make the API request to save the pet profile, with userId in the URL
                const response = await fetch(`http://localhost:8000/pet/${user_id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`, // Use the token from sessionStorage
                    },
                    body: JSON.stringify(dataToSend), // Send the data as JSON
                });

                // Handle response
                if (response.ok) {
                    const result = await response.json();
                    console.log(result);
                    alert("Success: Pet profile saved successfully!");
                    router.push('/homepage');
                } else {
                    const errorData = await response.json();
                    console.error("Error response:", errorData);
                    alert("Error: Unable to save profile. Please try again.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert("Error: Network error occurred.");
            }
        } else {
            alert("Error: Please fill out all required fields.");
        }
    };
    

    return (
        <div className="flex flex-col items-center p-5 bg-white min-h-screen">
            <div className="w-full max-w-md">
                {/* Back Arrow */}
                <div className="absolute top-6 left-4">
                    <Link href="/profile-petOwner">
                        <Image src="/back_arrow.png" alt="Back to homepage" width={32} height={32} />
                    </Link>
                </div>
                {/* Title and pet image */}
                <h2 className="jua text-3xl font-bold text-center mt-4">Create Pet Profile</h2>
                <h3 className="jua text-2xl font-bold text-center text-orange-500 mt-2">Pet</h3>

                {/* Form fields */}
                <div className="poppins mt-6">
                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Pet Name<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="Your pet's name"
                            value={formData.petName}
                            onChange={(e) => handleInputChange('petName', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Species<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="Dog, cat, etc."
                            value={formData.species}
                            onChange={(e) => handleInputChange('species', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Breed<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="Chihuahua, golden retriever, etc."
                            value={formData.breed}
                            onChange={(e) => handleInputChange('breed', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Age<span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="1, 1.5, etc."
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Health Conditions</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="Healthy, breathing difficulty, etc."
                            value={formData.healthConditions}
                            onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Preferences</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="If any"
                            value={formData.preferences}
                            onChange={(e) => handleInputChange('preferences', e.target.value)}
                        />
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSubmit}
                    className="poppins w-full bg-orange-500 text-white p-3 rounded mt-4"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default AddServiceProfile;


