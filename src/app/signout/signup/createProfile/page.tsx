'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CreateProfile = () => {
    return (
        <div className="flex flex-col min-h-screen p-5">
            <div className="flex flex-col flex-1 justify-center items-center">
                <h2 className="jua text-4xl font-bold text-black text-center">Create Profile</h2>
                <Image src="/whitepuppy.png" alt="White Puppy" width={160} height={180} className="my-5" />
                <p className="poppins text-base font-medium mb-5">What are you signing up to be?</p>
                <Link href="/signout/signup/createProfile/caretakerProfile" onClick={() => sessionStorage.setItem('profile_type', '2')} className="jua bg-orange-500 text-white text-xl font-bold py-3 px-6 rounded-lg my-2 w-1/2 text-center">
                    Caretaker                    
                </Link>
                <Link href="/signout/signup/createProfile/petOwnerProfile" onClick={() => sessionStorage.setItem('profile_type', '1')} className="jua bg-orange-500 text-white text-xl font-bold py-3 px-6 rounded-lg my-2 w-1/2 text-center">                  
                    Pet Owner
                </Link>
            </div>
        </div>
    );
};

export default CreateProfile;
