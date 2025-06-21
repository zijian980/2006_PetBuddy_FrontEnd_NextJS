'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

// Enum-like objects for `Availability`, `Location`, and `Service`
const Availability = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
};

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
    geylang_bahru :"Geylang Bahru",
    potong_pasir :"Potong Pasir",
    serangoon :"Serangoon",
    dhoby_ghaut_interchange :"Dhoby Ghaut Interchange",
    toapayoh :"Toa Payoh",
    braddell :"Braddell",
    bishan :"Bishan",
    marymount :"Marymount",
    bartley :"Bartley",
    paya_lebar :"Paya Lebar",
    eunos :"Eunos",
    bedok :"Bedok",
    tampines :"Tampines",
    pasir_ris :"Pasir Ris",
    simei :"Simei",
    expo :"Expo",
    tanah_merah :"Tanah Merah",
    changi_airport :"Changi Airport",
    bedok_north :"Bedok North",
    hougang :"Hougang",
    serangoon_north :"Serangoon North",
    yishun :"Yishun",
    sembawang :"Sembawang",
    woodlands :"Woodlands",
    admiralty :"Admiralty",
    marsiling :"Marsiling",
    woodlands_south :"Woodlands South",
    bukit_panjang :"Bukit Panjang",
    jelapang :"Jelapang",
    chua_chu_kang :"Chua Chu Kang",
    lot_one :"Lot One",
    bukit_gombak :"Bukit Gombak",
    beauty_world :"Beauty World",
    little_india :"Little India",
    orchard : "Orchard",
    somerset : "Somerset",
    novena : "Novena",
    toa_payoh_north : "Toa Payoh North",
    novena_north : "Novena North",
    bishan_north : "Bishan North",
    serangoon_south : "Serangoon South",
    yishun_north : "Yishun North",
    sembawang_north : "Sembawang North",
    bedok_north_east : "Bedok North East",
    jurong_east : "Jurong East",
    jurong_west : "Jurong West",
    bukit_batok : "Bukit Batok",
    lot_one_north : "Lot One North",
    woodlands_west : "Woodlands West",
    thomson_east_coast : "Thomson East Coast",
    tanjong_pagar : "Tanjong Pagar",
    bencoolen : "Bencoolen",
    king_albert_park : "King Albert Park",
    upper_bukit_timah : "Upper Bukit Timah",
    bukit_timah : "Bukit Timah",
    joo_kong : "Joo Koon",
    jurong_lake : "Jurong Lake",
    yishun_east : "Yishun East",
    kranji : "Kranji",
    bukit_gombak_east : "Bukit Gombak East",
    changi : "Changi",
    puah_road : "Puah Road",
    orchard_road : "Orchard Road"
};

const Service = {
    pet_walking: "Pet Walking",
    pet_feeding: "Pet Feeding",
    pet_grooming: "Pet Grooming",
    pet_training: "Pet Training",
    pet_sitting: "Pet Sitting",
    overnight_stay: "Overnight Stay",
    dog_daycare: "Dog Daycare",
};

const EditServiceProfile = () => {
    const [formData, setFormData] = useState({
        services: '',
        rates: '',
        availability: [] as string[],
        location: [] as string[],
    });
    const [image, setImage] = useState<string | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);
    const router = useRouter();
    const { id } = useParams(); // Assuming the ID of the service is passed via the route params

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = sessionStorage.getItem('access_token');
                const userId = sessionStorage.getItem('user_id')
                const serviceId = sessionStorage.getItem('service_id')
                const response = await fetch(`http://localhost:8000/service/${userId}/${serviceId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        services: data.service,
                        rates: data.service_rate.toString(),
                        availability: data.service_availability,
                        location: data.location,
                    });
                    setImage(data.image || null);
                } else {
                    console.error('Error fetching service data');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        
        fetchData();
    }, [id]);

    useEffect(() => {
        const requiredFieldsFilled =
            formData.services.trim() !== '' &&
            formData.rates.trim() !== '' &&
            formData.availability.length > 0 &&
            formData.location.length > 0;
        setIsFormValid(requiredFieldsFilled);
    }, [formData]);

    const handleInputChange = (key: string, value: any) => {
        setFormData({ ...formData, [key]: value });
    };

    const handleMultiSelectChange = (key: 'availability' | 'location', value: any) => {
        const updatedValue = formData[key].includes(value)
            ? formData[key].filter((item: any) => item !== value)
            : [...formData[key], value];
        handleInputChange(key, updatedValue);
    };

    const handleSubmit = async () => {
        if (isFormValid) {
            try {
                const accessToken = sessionStorage.getItem('access_token');
                if (!accessToken) {
                    alert("Error: User not authenticated.");
                    return;
                }

                const payload = {
                    service: formData.services,
                    service_rate: parseInt(formData.rates),
                    service_availability: formData.availability,
                    location: formData.location,
                };

                const userId = sessionStorage.getItem('user_id')
                const serviceId = sessionStorage.getItem('service_id')

                const response = await fetch(`http://localhost:8000/service/${userId}/${serviceId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    alert("Success: Service updated successfully!");
                    router.push('/profile-caretaker');
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error("Submission error:", error);
                alert("Error: Could not submit service.");
            }
        } else {
            alert("Error: Please fill out all required fields.");
        }
    };

    return (
        <div className="flex flex-col items-center p-5 bg-white min-h-screen">
            <div className="w-full max-w-md">
                <h2 className="jua text-3xl font-bold text-center mt-4">Edit Service</h2>

                <div className="flex flex-col items-center mt-4">
                    {image ? (
                        <img src={image} alt="Service" className="w-72 h-36 rounded-lg border border-orange-500 mt-2" />
                    ) : (
                        <Image src="/doggrooming.png" alt="Service" width={300} height={150} className="rounded-lg border border-orange-500 mt-2" />
                    )}
                    {/* <button onClick={pickImage} className="poppins text-blue-500 underline mt-4">Edit service picture</button> */}
                </div>

                <div className="poppins mt-6">
                    {/* Services */}
                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Type of Service<span className="text-red-500">*</span></label>
                        <select
                            className="w-full p-2 border border-orange-500 rounded"
                            value={formData.services}
                            onChange={(e) => handleInputChange('services', e.target.value)}
                        >
                            <option value="">Select a service</option>
                            {Object.values(Service).map((service) => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>

                    {/* Rates */}
                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Service Rates<span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            min = "5"
                            step = "5"
                            max = "200"
                            className="w-full p-2 border border-orange-500 rounded"
                            placeholder="50, etc."
                            value={formData.rates}
                            onChange={(e) => handleInputChange('rates', e.target.value)}
                        />
                    </div>

                    {/* Availability */}
                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Availability<span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(Availability).map((day) => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleMultiSelectChange('availability', day)}
                                    className={`p-2 border rounded ${formData.availability.includes(day) ? 'bg-orange-500 text-white' : 'border-orange-500'}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="mb-4">
                        <label className="block text-lg font-bold mb-2">Location<span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.values(Location).map((location) => (
                                <button
                                    key={location}
                                    type="button"
                                    onClick={() => handleMultiSelectChange('location', location)}
                                    className={`p-2 border rounded ${formData.location.includes(location) ? 'bg-orange-500 text-white' : 'border-orange-500'}`}
                                >
                                    {location}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    className="poppins w-full bg-orange-500 text-white p-3 rounded mt-4"
                    // disabled={!isFormValid}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default EditServiceProfile;
