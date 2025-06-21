import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const events = [
  {
    id: 1,
    name: 'Event 1',
    date: '2023-10-01',
    location: 'Location 1',
    time: '10:00 AM',
    avatarUrl: '/dog.png',
  },
  {
    id: 2,
    name: 'Event 2',
    date: '2023-10-02',
    location: 'Location 2',
    time: '11:00 AM',
    avatarUrl: '/dog.png',
  },
  {
    id: 3,
    name: 'Event 3',
    date: '2023-10-03',
    location: 'Location 3',
    time: '12:00 PM',
    avatarUrl: '/dog.png',
  },
];

export default function EventDetails() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  const event = events.find(event => event.id === parseInt(id as string));

  if (!event) {
    return <p>Event not found</p>;
  }

  return (
    <div className="p-8">
      <Link href="/upcoming-bookings">
        <div className="text-orange-500 text-5xl mb-4 ml-16 inline-block">←</div>
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center">{event.name}</h1>
      <div className="flex flex-col items-center">
        <Image
          src={event.avatarUrl}
          alt={event.name}
          width={128}
          height={128}
          className="rounded-full mb-4"
        />
        <p className="text-gray-600 mb-2">Date: {event.date}</p>
        <p className="text-gray-600 mb-2">Location: {event.location}</p>
        <p className="text-gray-600 mb-8">Time: {event.time}</p>
        <div className="flex gap-4">
          <button className="bg-orange-500 text-white px-4 py-2 rounded">Change Time</button>
          <button className="bg-orange-500 text-white px-4 py-2 rounded">Cancel Booking</button>
        </div>
      </div>
    </div>
  );
}