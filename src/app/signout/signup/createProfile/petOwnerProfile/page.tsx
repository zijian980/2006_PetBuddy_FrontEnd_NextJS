'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Gender = {
    female: "female",
    male: "male",
    prefer_not_to_say: "prefer not to say"
}

const Location = {
    dhoby_ghaut: "Dhoby Ghaut",
    outram_park: "Outram Park",
    chinatown: "Chinatown",
    clarke_quay: "Clarke Quay",
    boat_quay: "Boat Quay",
    city_hall: "City Hall",
    esplanade: "Esplanade",
    raffles_place: "Raffles Place",
    bayfront: "Bayfront",
    marina_bay: "Marina Bay",
    promontory: "Promontory",
    marina_bay_sands: "Marina Bay Sands",
    bugis: "Bugis",
    lavender: "Lavender",
    kallang: "Kallang",
    geylang_bahru: "Geylang Bahru",
    potong_pasir: "Potong Pasir",
    serangoon: "Serangoon",
    dhoby_ghaut_interchange: "Dhoby Ghaut Interchange",
    toapayoh: "Toa Payoh",
    braddell: "Braddell",
    bishan: "Bishan",
    marymount: "Marymount",
    bartley: "Bartley",
    paya_lebar: "Paya Lebar",
    eunos: "Eunos",
    bedok: "Bedok",
    tampines: "Tampines",
    pasir_ris: "Pasir Ris",
    simei: "Simei",
    expo: "Expo",
    tanah_merah: "Tanah Merah",
    changi_airport: "Changi Airport",
    bedok_north: "Bedok North",
    hougang: "Hougang",
    serangoon_north: "Serangoon North",
    yishun: "Yishun",
    sembawang: "Sembawang",
    woodlands: "Woodlands",
    admiralty: "Admiralty",
    marsiling: "Marsiling",
    woodlands_south: "Woodlands South",
    bukit_panjang: "Bukit Panjang",
    jelapang: "Jelapang",
    chua_chu_kang: "Chua Chu Kang",
    lot_one: "Lot One",
    bukit_gombak: "Bukit Gombak",
    beauty_world: "Beauty World",
    little_india: "Little India",
    orchard: "Orchard",
    somerset: "Somerset",
    novena: "Novena",
    toa_payoh_north: "Toa Payoh North",
    novena_north: "Novena North",
    bishan_north: "Bishan North",
    serangoon_south: "Serangoon South",
    yishun_north: "Yishun North",
    sembawang_north: "Sembawang North",
    bedok_north_east: "Bedok North East",
    jurong_east: "Jurong East",
    jurong_west: "Jurong West",
    bukit_batok: "Bukit Batok",
    lot_one_north: "Lot One North",
    woodlands_west: "Woodlands West",
    thomson_east_coast: "Thomson East Coast",
    tanjong_pagar: "Tanjong Pagar",
    bencoolen: "Bencoolen",
    king_albert_park: "King Albert Park",
    upper_bukit_timah: "Upper Bukit Timah",
    bukit_timah: "Bukit Timah",
    joo_kong: "Joo Koon",
    jurong_lake: "Jurong Lake",
    yishun_east: "Yishun East",
    kranji: "Kranji",
    bukit_gombak_east: "Bukit Gombak East",
    changi: "Changi",
    puah_road: "Puah Road",
    orchard_road: "Orchard Road"
};

const CaretakerProfileNew = () => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        location: '',
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [nameError, setNameError] = useState('');
    const [genderError, setGenderError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [errorMessage, setErrorMessage] = useState<string>('');


    useEffect(() => {
        const requiredFieldsFilled =
            formData.name.trim() !== '' &&
            formData.dob.trim() !== '' &&
            formData.gender.trim() !== '' &&
            formData.location.trim() !== '';

            setIsFormValid(requiredFieldsFilled && !errorMessage && !nameError);
        }, [formData]);

    const handleInputChange = (key: string, value: string) => {
        setFormData({ ...formData, [key]: value });

        // Validate name
        if (key === 'name') {
            if (value.trim().length < 3 || value.trim().length > 30) {
                setNameError('Name must be between 3 and 30 characters.');
            } else {
                setNameError('');
            }
        }

        // Validate gender
        if (key === 'gender' && value.trim() === '') {
            setGenderError('Please select your gender.');
        } else {
            setGenderError('');
        }

        // Validate location
        if (key === 'location' && value.trim() === '') {
            setLocationError('Please select your location.');
        } else {
            setLocationError('');
        }
    };

    const today = new Date();
    today.setFullYear(today.getFullYear() - 16); // Subtract 16 years for DOB validation
    const maxDate = today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'

    const handleSubmit = async () => {
        if (isFormValid && !nameError) { // Add nameError check here
            try {
                const access_token = sessionStorage.getItem('access_token');
                const user_id = sessionStorage.getItem('user_id');
    
                if (!access_token || !user_id) {
                    alert('Error: User not logged in.');
                    return;
                }
    
                const response = await fetch(`http://localhost:8000/petowner`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...formData,
                        user_id,
                    }),
                });
    
                if (response.ok) {
                    alert('Profile saved successfully!');
                } else {
                    throw new Error('Failed to save profile');
                }
            } catch (error) {
                alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else {
            alert('Please fill out all required fields.');
        }
    };
    

    return (
        <div className="flex flex-col items-center p-5 bg-white min-h-screen">
            {/* Back Arrow */}
            <div className="absolute top-6 left-4">
                <Link href="/profile-petOwner">
                    <Image src="/back_arrow.png" alt="Back to homepage" width={32} height={32} />
                </Link>
            </div>
            {/* Title */}
            <h2 className="jua text-4xl font-bold text-black text-center my-4">Create Profile</h2>
            <h3 className="jua text-2xl font-bold text-orange-500 text-center mb-5">Pet Owner</h3>

            {/* Form fields */}
            <div className="poppins w-full max-w-md">
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

                {/* Date of Birth */}
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

                {/* Gender Dropdown */}
                <div className="mb-4">
                    <label className="block text-lg font-bold mb-2">Gender<span className="text-red-500">*</span></label>
                    <select
                        className="w-full p-2 border border-orange-500 rounded"
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                        <option value="">Select Gender</option>
                        <option value={Gender.female}>Female</option>
                        <option value={Gender.male}>Male</option>
                        <option value={Gender.prefer_not_to_say}>Prefer not to say</option>
                    </select>
                    {genderError && <p className="text-red-500 text-sm">{genderError}</p>}
                </div>

                {/* Location Dropdown */}
                <div className="mb-4">
                    <label className="block text-lg font-bold mb-2">Location<span className="text-red-500">*</span></label>
                    <select
                        className="w-full p-2 border border-orange-500 rounded"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                    >
                        <option value="">Select Location</option>
                        {Object.values(Location).map((location) => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                    {locationError && <p className="text-red-500 text-sm">{locationError}</p>}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-6">
                    <button
                        className={`poppins py-2 px-4 rounded mt-4 ${isFormValid ? 'bg-orange-500 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}`}
                        onClick={handleSubmit}
                        disabled={!!errorMessage || !isFormValid}
                    >
                        Submit
                    </button>
                </div>
                {/* Add Pet Section */}
                <div className="flex flex-col items-center mt-10">
                    <Link href="/signout/signup/createProfile/petOwnerProfile/addPet" className="flex items-center justify-center w-16 h-16 rounded-full">                    
                    <Image src="/addIcon.png" alt="White Puppy" width={160} height={160} className="my-5" />
                    </Link>
                    <p className="poppins text-lg text-gray-500 mt-2">Start adding your pets!</p>
                </div>
            </div>
        </div>
    );
};

export default CaretakerProfileNew;