'use client';

import Link from 'next/link';
import Image from 'next/image';

const WelcomeScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-5 bg-white">
      {/* Status Bar */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
        }
      `}</style>

      {/* Title */}
      <h2 className="jua text-4xl text-black-400">Welcome to</h2>
      <h1 className="jua text-8xl text-orange-500">PetBuddy!</h1>

      {/* Mascot Image */}
      <Image 
        src="/corgi.png" 
        alt="Corgi Mascot" 
        width={180} 
        height={180} 
        className="my-5"
      />

      {/* Description */}
      <p className="poppins text-lg text-gray-600 text-center my-5">
        Where you can connect with trusted caretakers for personalized pet care services. Let your pet get the love and attention they deserve!
      </p>

      {/* Get Started Button */}
      <Link href="./signout/login" className="poppins bg-orange-500 text-white py-2 px-4 rounded">
          Get Started
      </Link>
    </div>
  );
};

export default WelcomeScreen;
