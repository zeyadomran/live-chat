'use client';
import 'regenerator-runtime/runtime';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { auth } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/button';

export default function Home() {
	const [user] = useAuthState(auth);
	const googleSignIn = () => {
		const provider = new GoogleAuthProvider();
		signInWithRedirect(auth, provider);
	};
	const Video = dynamic(
		() => import('@/components/video').then((mod) => mod.default),
		{
			ssr: false,
		}
	);
	return (
		<div className="flex w-screen h-screen items-center justify-center">
			{user ? (
				<Video />
			) : (
				<Button
					label="Sign in"
					icon={<FcGoogle />}
					style="secondary"
					onClick={() => {
						googleSignIn();
					}}
				/>
			)}
		</div>
	);
}
