'use client';

import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, useMap, AdvancedMarker, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

type Coordinates = {
  lat: number;
  lng: number;
};

const LocationCoordinates: { [key: string]: Coordinates } = {
  DhobyGhaut: { lat: 1.2983, lng: 103.8477 },
  OutramPark: { lat: 1.2783, lng: 103.8398 },
  Chinatown: { lat: 1.2834, lng: 103.8438 },
  ClarkeQuay: { lat: 1.2883, lng: 103.8470 },
  BoatQuay: { lat: 1.2879, lng: 103.8503 },
  CityHall: { lat: 1.2931, lng: 103.8520 },
  Esplanade: { lat: 1.2895, lng: 103.8555 },
  RafflesPlace: { lat: 1.2834, lng: 103.8514 },
  Bayfront: { lat: 1.2816, lng: 103.8603 },
  MarinaBay: { lat: 1.2835, lng: 103.8606 },
  Promontory: { lat: 1.2796, lng: 103.8554 },
  MarinaBaySands: { lat: 1.2834, lng: 103.8609 },
  Bugis: { lat: 1.3005, lng: 103.8565 },
  Lavender: { lat: 1.3077, lng: 103.8631 },
  Kallang: { lat: 1.3111, lng: 103.8719 },
  GeylangBahru: { lat: 1.3193, lng: 103.8711 },
  PotongPasir: { lat: 1.3316, lng: 103.8687 },
  Serangoon: { lat: 1.3496, lng: 103.8739 },
  DhobyGhautInterchange: { lat: 1.2983, lng: 103.8469 },
  ToaPayoh: { lat: 1.3321, lng: 103.8470 },
  Braddell: { lat: 1.3417, lng: 103.8490 },
  Bishan: { lat: 1.3504, lng: 103.8485 },
  Marymount: { lat: 1.3493, lng: 103.8399 },
  Bartley: { lat: 1.3415, lng: 103.8801 },
  PayaLebar: { lat: 1.3182, lng: 103.8921 },
  Eunos: { lat: 1.3195, lng: 103.9032 },
  Bedok: { lat: 1.3236, lng: 103.9270 },
  Tampines: { lat: 1.3496, lng: 103.9568 },
  PasirRis: { lat: 1.3721, lng: 103.9492 },
  Simei: { lat: 1.3435, lng: 103.9531 },
  Expo: { lat: 1.3344, lng: 103.9617 },
  TanahMerah: { lat: 1.3277, lng: 103.9469 },
  ChangiAirport: { lat: 1.3644, lng: 103.9915 },
  BedokNorth: { lat: 1.3332, lng: 103.9273 },
  Hougang: { lat: 1.3713, lng: 103.8922 },
  SerangoonNorth: { lat: 1.3735, lng: 103.8711 },
  Yishun: { lat: 1.4291, lng: 103.8355 },
  Sembawang: { lat: 1.4490, lng: 103.8200 },
  Woodlands: { lat: 1.4362, lng: 103.7867 },
  Admiralty: { lat: 1.4406, lng: 103.8004 },
  Marsiling: { lat: 1.4324, lng: 103.7744 },
  WoodlandsSouth: { lat: 1.4337, lng: 103.7811 },
  BukitPanjang: { lat: 1.3774, lng: 103.7631 },
  Jelapang: { lat: 1.3837, lng: 103.7615 },
  ChuaChuKang: { lat: 1.3857, lng: 103.7441 },
  LotOne: { lat: 1.3851, lng: 103.7449 },
  BukitGombak: { lat: 1.3571, lng: 103.7517 },
  BeautyWorld: { lat: 1.3411, lng: 103.7756 },
  LittleIndia: { lat: 1.3061, lng: 103.8496 },
  Orchard: { lat: 1.3048, lng: 103.8318 },
  Somerset: { lat: 1.3003, lng: 103.8370 },
  Novena: { lat: 1.3204, lng: 103.8432 },
  ToaPayohNorth: { lat: 1.3363, lng: 103.8455 },
  NovenaNorth: { lat: 1.3271, lng: 103.8485 },
  BishanNorth: { lat: 1.3590, lng: 103.8473 },
  SerangoonSouth: { lat: 1.3481, lng: 103.8687 },
  YishunNorth: { lat: 1.4325, lng: 103.8347 },
  SembawangNorth: { lat: 1.4507, lng: 103.8274 },
  BedokNorthEast: { lat: 1.3380, lng: 103.9273 },
  JurongEast: { lat: 1.3334, lng: 103.7421 },
  JurongWest: { lat: 1.3405, lng: 103.7086 },
  BukitBatok: { lat: 1.3492, lng: 103.7494 },
  LotOneNorth: { lat: 1.3892, lng: 103.7457 },
  WoodlandsWest: { lat: 1.4378, lng: 103.7853 },
  ThomsonEastCoast: { lat: 1.3510, lng: 103.8347 },
  TanjongPagar: { lat: 1.2764, lng: 103.8458 },
  Bencoolen: { lat: 1.2987, lng: 103.8529 },
  KingAlbertPark: { lat: 1.3351, lng: 103.7769 },
  UpperBukitTimah: { lat: 1.3482, lng: 103.7697 },
  BukitTimah: { lat: 1.3404, lng: 103.7741 },
  JooKong: { lat: 1.3272, lng: 103.6787 },
  JurongLake: { lat: 1.3342, lng: 103.7274 },
  YishunEast: { lat: 1.4305, lng: 103.8327 },
  Kranji: { lat: 1.4253, lng: 103.7623 },
  BukitGombakEast: { lat: 1.3562, lng: 103.7513 },
  Changi: { lat: 1.3675, lng: 103.9877 },
  PuahRoad: { lat: 1.3061, lng: 103.8523 },
  OrchardRoad: { lat: 1.3049, lng: 103.8318 }
};

interface User {
  id: number;
}

interface Caretaker {
  name: string;
  dob: string;      
  gender: 'male' | 'female' | 'other';
  work_exp: number;
  service: Service[]; 
  user_id: number;
  user: User;
}

// Type for days of the week
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Type for service details
interface Service {
  service_id: number;
  service: string;
  service_rate: number;
  service_availability: DayOfWeek[];
  location: string[];
  caretaker: Caretaker;
  review: Review[];
}

interface ServiceWithAverageRating {
  service: Service;
  averageRating: number;
}

interface Review {
  service_id: number;
  rating: number;
  review_description: string;
  user_id: number;
  anonymous: boolean;
}

const token = sessionStorage.getItem('access_token');

export default function Mapper() {
    useEffect(() => {
      console.log('API Key:', process.env.NEXT_PUBLIC_MAPS_API_KEY);
    }, []);

    const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      const fetchCaretakers = async () => {
        
        if (!token) {
          router.push('/signout/login');
          return;
        }
  
        try {
          const response = await axios.get<Caretaker[]>('http://localhost:8000/caretaker', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          setCaretakers(response.data);
  
          const responseService = await axios.get<Service[]>('http://localhost:8000/service', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
  
          setServices(responseService.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching caretakers:', err);
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            sessionStorage.clear();
            router.push('/signout/login');
          }
          setError('Failed to load caretakers');
          setLoading(false);
        }
      };
  
      fetchCaretakers();
    }, [router]);

    useEffect(() => {
      if (!token || !services.length) return;
  
      const fetchReviews = async () => {
        try {
          const reviewsData = await Promise.all(
            services.map(async service => {
              try {
                const response = await axios.get<Review[]>(
                  `http://localhost:8000/review/${service.service_id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }
                );
                return response.data || [];
              } catch (err) {
                console.error(`Error fetching reviews for service ${service.service_id}:`, err);
                return [];
              }
            })
          );
          setReviews(reviewsData.flat());
        } catch (err) {
          console.error('Error fetching reviews:', err);
          setReviews([]);
        }
      };
  
      fetchReviews();
    }, [services, token]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
        </div>
      );
    }

    if (error) {
      return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    const servicesWithAverageRating: ServiceWithAverageRating[] = services.map(service => {
      const serviceReviews = reviews.filter(review => review.service_id === service.service_id);
      const totalRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = serviceReviews.length > 0 ? totalRating / serviceReviews.length : 0;
      return {
        service: service,
        averageRating: averageRating || 0
      };
    });
  
    return (
      <><Link href="/search">
        <button className="absolute z-10 bottom-16 right-16 bg-orange-500 text-2xl text-white p-4 rounded-full mb-16 shadow-lg">
        ←
        </button>
      </Link><APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY || ''} onLoad={() => console.log('Maps API has loaded.')}>
          <Map
            defaultZoom={13}
            defaultCenter={{ lat: 1.36667, lng: 103.80000 }}
            onCameraChanged={(ev: MapCameraChangedEvent) => console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)}
            mapId='da37f3254c6a6d1c'
            style={{ width: '100%', height: '100vh' }}
          >
            <CaretakerMarkers caretakers={caretakers} services={services} servicesWithAverageRating={servicesWithAverageRating} />
          </Map>
        </APIProvider></>
    );
  }
  
  const CaretakerMarkers = (props: { caretakers: Caretaker[] ; services: Service[] ; servicesWithAverageRating: ServiceWithAverageRating[] }) => {
    const map = useMap();
    const router = useRouter();
    const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
    const clusterer = useRef<MarkerClusterer | null>(null);

    console.log(props.services);
  
    useEffect(() => {
      if (map && !clusterer.current) {
        clusterer.current = new MarkerClusterer({ map });
      }
  
    const newMarkers: { [key: string]: Marker } = {};
      
  props.services.forEach((service) => {
    const serviceRating = props.servicesWithAverageRating.find(
      s => s.service.service_id === service.service_id
    )?.averageRating || 0;
    service.location.forEach((loc) => {      
      const serviceLocation = LocationCoordinates[loc.replace(/\s+/g, '')];
      console.log(serviceLocation);
      console.log(loc);
      if (serviceLocation) {
        const marker = new google.maps.Marker({
          position: serviceLocation,
          map,
          title: service.caretaker.name,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="poppins" style="display: flex; align-items: center;">
              <img src="/janedoe.png" alt="${service.caretaker.name}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;" />
              <div>
                <h3>${service.caretaker.name}</h3>
                <br />
                <p>Service: ${service.service}</p>
                <p>⭐ ${ serviceRating }</p>
                <p>Rate: ${service.service_rate}</p>
                <p>Availability: ${service.service_availability.join(', ')}</p>
                <p>Location: ${loc}</p>
              </div>
            </div>
          `,
        });

        infoWindow.open(map, marker); // Open info window when the map is launched

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setTimeout(() => {
            router.push(`/search/caretaker/${service.caretaker.user.id}/${service.service_id}`);
          });
        });

        newMarkers[`${service.caretaker.name}-${service.service}-${loc}`] = marker;
        clusterer.current?.addMarker(marker);
      }
    });
  });
      
      setMarkers(newMarkers);
  
      return () => {
        Object.values(newMarkers).forEach((marker) => marker.setMap(null));
        clusterer.current?.clearMarkers();
      };
    }, [map, props.caretakers]);
  
    return null;
  };


  /* const caretakers: Caretaker[] = [
    {
      id: 1,
      name: 'Caretaker 1',
      location: { lat: -33.8567844, lng: 151.213108 },
      avatar: '/dog.png',
      starRating: 4.5,
      services: ['Walking', 'Sitting'],
      availability: 'Weekdays',
      rates: '$30/hour',
    },
    {
      id: 2,
      name: 'Caretaker 2',
      location: { lat: -33.8472767, lng: 151.2188164 },
      avatar: '/dog.png',
      starRating: 4.0,
      services: ['Walking'],
      availability: 'Weekends',
      rates: '$25/hour',
    },
    {
      id: 3,
      name: 'Caretaker 3',
      location: { lat: -33.8209738, lng: 151.2563253 },
      avatar: '/dog.png',
      starRating: 4.7,
      services: ['Walking', 'Sitting'],
      availability: 'Weekdays and Weekends',
      rates: '$50/hour',
    },
  ]; */