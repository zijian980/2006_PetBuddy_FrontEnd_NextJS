"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

interface Payment {
  payment_id: number;
  payment_amount: number;
  service_id: number;
  sender: number;
  receiver: number;
  paid_at: string;
}

interface Service {
  service_id: number;
  service: string;
  service_rate: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface PaymentWithDetails extends Payment {
  service: string;
  other_user_name: string;
}

const PaymentHistoryPage = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<'petowner' | 'caretaker' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');
      const profileType = sessionStorage.getItem('profile_type');

      if (!token || !userId) {
        router.push('/login');
        return;
      }

      setUserType(profileType === '2' ? 'caretaker' : 'petowner');

      try {
        const endpoint = profileType === '2' 
          ? `http://localhost:8000/payment/${userId}`
          : `http://localhost:8000/payment/petowner/${userId}`;

        const response = await axios.get<Payment[]>(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const paymentDetailsPromises = response.data.map(async (payment) => {
          try {
            const serviceResponse = await axios.get<Service>(
              `http://localhost:8000/service/${payment.receiver}/${payment.service_id}`, 
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );

            const otherUserId = profileType === '2' ? payment.sender : payment.receiver;
            let userResponse;

            try {
              userResponse = await axios.get<User>(
                profileType === '2'
                  ? `http://localhost:8000/petowner/${otherUserId}`
                  : `http://localhost:8000/caretaker/${otherUserId}`,
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );
            } catch {
              userResponse = await axios.get<User>(
                `http://localhost:8000/users/${otherUserId}`,
                {
                  headers: { 'Authorization': `Bearer ${token}` }
                }
              );
            }

            return {
              ...payment,
              service: serviceResponse.data.service,
              other_user_name: userResponse.data.name
            };
          } catch {
            return {
              ...payment,
              service: 'Unknown Service',
              other_user_name: 'Unknown User'
            };
          }
        });

        const paymentsWithDetails = await Promise.all(paymentDetailsPromises);
        setPayments(paymentsWithDetails);
        setLoading(false);

      } catch (err) {
        console.error('Error fetching payment history:', err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setPayments([]);
          } else if (err.response?.status === 401) {
            sessionStorage.clear();
            router.push('/login');
          }
        }
        setError('Failed to load payment history');
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [router]);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B3D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 pb-20">
      <div className="flex items-center mb-6">
        <Link 
          href={userType === 'caretaker' ? '/profile-caretaker' : '/profile-petOwner'} 
          className="text-orange-500 mr-4"
        >
          ←
        </Link>
        <h1 className="text-2xl font-bold">Payment History</h1>
      </div>

      <div className="space-y-4">
        {payments.length > 0 ? (
          payments.slice().reverse().map((payment) =>(
            <div key={payment.payment_id} className="bg-orange-50 rounded-2xl p-4">
              <div className="flex items-start space-x-4">
                <Image
                  src="/kimmydog.png"
                  alt={payment.service}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{payment.service}</h3>
                      <p className="text-sm text-gray-600">
                        {userType === 'caretaker' ? 'from' : 'to'} {payment.other_user_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${payment.payment_amount}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(payment.paid_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No payment history found
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;