'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faComment, faUser, faBell } from '@fortawesome/free-solid-svg-icons'; // Added faBell import for notifications icon
import axios from 'axios';

interface UserData {
  name: string;
  user: {
    username: string;
  };
}

const TabbedMenu = () => {
  const pathname = usePathname();
  const [profilePath, setProfilePath] = useState('/profile-petOwner');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    async function fetchUserData() {
      const token = sessionStorage.getItem('access_token');
      const userId = sessionStorage.getItem('user_id');
      const profileType = Number(sessionStorage.getItem('profile_type'));

      if (!token || !userId) return;

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      try {
        const endpoint = profileType === 2 
          ? `http://localhost:8000/caretaker/${userId}`
          : `http://localhost:8000/petowner/${userId}`;

        const response = await axios.get<UserData>(endpoint, config);
        setUserName(response.data.user.username || response.data.name);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    function checkProfileType() {
      const profileType = Number(sessionStorage.getItem('profile_type'));
      const newPath = profileType === 2 ? '/profile-caretaker' : '/profile-petOwner';
      setProfilePath(newPath);
      fetchUserData();
    }

    checkProfileType();

    const interval = setInterval(fetchUserData, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [pathname]);

  const profileType = Number(sessionStorage.getItem('profile_type'));
  const tabs = [
    { href: '/homepage', icon: faHome, label: 'Home' },
    ...(profileType !== 2 ? [{ href: '/search', icon: faSearch, label: 'Search' }] : []),
    { href: '/messages', icon: faComment, label: 'Chat' },
    { href: profilePath, icon: faUser, label: 'Profile' },
  ];

  const hiddenPaths = ['/signout'];

  if (hiddenPaths.some(hiddenPath => pathname.includes(hiddenPath))) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white dark:bg-black p-4 border-b border-gray-200 dark:border-gray-700">
        <span className="jua text-xl font-bold text-orange-500">PetBuddy</span>
        
        {/* Container for the username and notification icon */}
        <div className="flex items-center space-x-4">
          {/* Displaying username */}
          <span className="poppinsbold text-l text-orange-500">Hello, {userName}</span>
          
          {/* New Link for the bell icon that leads to /notifications */}
            <Link href="/notifications" className="relative">
            <FontAwesomeIcon
              icon={faBell} // Bell icon for notifications
              className="text-orange-500 text-xl"
              style={{ cursor: 'pointer' }}
            />
{/*             {sessionStorage.getItem('notifications') && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
            )} */}
            </Link>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 flex justify-around bg-white dark:bg-black p-4 border-t border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={tab.icon}
              className={`jua text-2xl ${pathname === tab.href ? 'text-orange-500' : 'text-gray-500'}`}
              style={{ opacity: pathname === tab.href ? 1 : 0.5 }}
            />
            <span className={`jua text-xs ${pathname === tab.href ? 'text-orange-500' : 'text-gray-500'}`}>
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default TabbedMenu;
