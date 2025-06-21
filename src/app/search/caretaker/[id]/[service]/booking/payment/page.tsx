'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';  // Import axios for sending requests
import { useRouter } from 'next/navigation';
import moment from 'moment-timezone';


interface BookingData {
  caretakerId: number;
  serviceId: number;
  serviceType: number;
  location: string;
  petName: string;
  petId: number;
  timeslots: string[];
  serviceRate: number;
}

const PaymentPage = () => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isClient, setIsClient] = useState(false); // State to ensure router works client-side
  const [routerReady, setRouterReady] = useState(false); // Ensure router is ready
  const [paymentSuccess, setPaymentSuccess] = useState(false); // State for success notification
  const [paymentError, setPaymentError] = useState<string | null>(null); // State for error message
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();  // Using useRouter hook
  const access_token = sessionStorage.getItem('access_token');

  useEffect(() => {
    // Ensures this runs only on the client side
    setIsClient(true);
    setRouterReady(true); // Set router as ready
  }, []);

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (data) {
      setBookingData(JSON.parse(data));
    }
  }, []);

  if (!bookingData || !isClient || !routerReady) {
    return <div>Loading...</div>;
  }

  const { caretakerId, serviceId, serviceType, location, petName, petId, timeslots, serviceRate } = bookingData;

  // Function to handle payment
  const handlePayment = async () => {
    console.log("Making payment request for:", { caretakerId, serviceId });
    setLoading(true); // Show loading indicator
    try {
      if (!access_token) {
        alert('Access token is missing. Please log in again.');
        return;
      }
      
      const response = await axios.post(
        `http://localhost:8000/payment/${caretakerId}/${serviceId}?sessions=${timeslots.length}`,
        {
          caretaker_id: caretakerId,
          service_id: serviceId,
          sessions: timeslots.length,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );


      let calendarUpdateSuccess = true;

      for (const timeslot of timeslots) {
        const start = new Date(timeslot);
        const end = new Date(start.getTime() + 30 * 60000); // Add 30 minutes
        const formattedStart = start.toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T');
        const formattedEnd = end.toLocaleString('sv-SE', { timeZone: 'Asia/Singapore' }).replace(' ', 'T');
        console.log(formattedStart, formattedEnd);

        try {
          const calendarResponse = await axios.post(
        `http://localhost:8000/calendar/${caretakerId}/${serviceId}/${petId}`,
        {
          location: location,
          start_time: formattedStart,
          end_time: formattedEnd,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
          );

          if (calendarResponse.status !== 201) {
        calendarUpdateSuccess = false;
        setPaymentError('Failed to update calendar for one or more timeslots.');
        break;
          }
        } catch (error: unknown) {
          console.error('Calendar update failed:', error);
          calendarUpdateSuccess = false;
          setPaymentError('Failed to update calendar for one or more timeslots.');
          break;
        }
      }

      if (calendarUpdateSuccess && response.status === 201) {
        // Set success message
        setPaymentSuccess(true);
        
        // Redirect to homepage after 2 seconds
        setTimeout(() => {
          router.push('/homepage');  // Redirect to the homepage
        }, 2000);
      }
    } catch (error: unknown) {
      console.error('Payment failed:', error);

      if (axios.isAxiosError(error) && error.response) {
        const errorDetail = error.response.data.detail;
        setPaymentError(`Payment failed: ${errorDetail}`);
      } else {
        setPaymentError('Payment failed, please try again.');
      }
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-8">
      {/* Success Notification */}
      {paymentSuccess && (
        <div className="text-center text-green-500 font-bold text-xl mb-4">
          Payment Successful! Redirecting to homepage...
        </div>
      )}

      {/* Error Notification */}
      {paymentError && (
        <div className="text-center text-red-500 font-bold text-xl mb-4">
          {paymentError}
        </div>
      )}

      {/* Payment details */}
      {!paymentSuccess && (
        <div className="text-center">
          <div className="flex mb-8 justify-center">
            <Link href={`/search/caretaker/${caretakerId}/${serviceId}/booking`}>
              <div className="text-orange-500 text-xl mr-4">←</div>
            </Link>
            <h1 className="jua text-3xl font-bold">Payment</h1>
          </div>
          <div className="text-left mb-8 poppins">
            {/* <p><strong>Caretaker:</strong> {caretakerId}</p> */}
            <p><strong>Service:</strong> {serviceType}</p>
            <p><strong>Location:</strong> {location}</p>
            <p><strong>Pet’s name:</strong> {petName}</p>
            <p>
              <strong>Timeslots chosen:</strong> {timeslots.map(timeslot => 
                moment(timeslot).tz("Asia/Singapore").format("YYYY-MM-DD HH:mm")
              ).join(', ')}
            </p>

          </div>
          <div className="text-left mb-8 poppins">
            <p><strong>Service Fee: </strong>{`$${serviceRate * timeslots.length}`}</p>
            <p>Please make your payment via the QR code</p>
          </div>
          
          {/* Centered QR code and Pay button */}
          <div className="flex flex-col justify-center items-center mb-8">
            <Image src="/qr-code.png" alt="QR Code" width={200} height={200} />
            <button
              className="poppins bg-orange-500 text-white px-4 py-2 rounded mt-4"
              onClick={handlePayment} // Trigger the payment function on click
              disabled={loading} // Disable the button while processing
            >
              {loading ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;