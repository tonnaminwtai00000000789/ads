// app/lootlabs-callback/page.tsx (Next.js App Router)
// หรือ pages/lootlabs-callback.tsx (Pages Router)

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner'; // หรือ sonner, react-toastify
import Loading from '@/components/Loading';


export default function LootLabsCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing your request...');

    useEffect(() => {
        const processCallback = async () => {
            // ✅ ดึง token และ discord_id จาก URL
            const token = searchParams.get('token');
            const discord_id = searchParams.get('discord_id');

            if (!token || !discord_id) {
                setStatus('error');
                setMessage('Invalid callback parameters');
                toast.error('Invalid request');
                setTimeout(() => router.push('/'), 3000);
                return;
            }

            try {
                // ✅ เรียก API เพื่อ generate key
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/genkey-loot`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Secret': process.env.NEXT_PUBLIC_API_KEY || '',
                        },
                        body: JSON.stringify({ token, discord_id }),
                    }
                );

                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    toast.success('Key generated successfully!');
                    router.push('/getkey');
                       } else {
                    throw new Error(data.message || 'Failed to generate key');
                }
            } catch (error) {
                console.error('Error generating key:', error);
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'An error occurred');
                toast.error('Failed to generate key');
                
                setTimeout(() => router.push('/'), 3000);
            }
        };

        processCallback();
    }, [searchParams, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background/50">
            <div className="text-center p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700 max-w-md">
                {status === 'loading' && (
                    <>
<Loading />; 
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mb-6">
                            <svg
                                className="w-16 h-16 text-red-500 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                        <p className="text-gray-400">{message}</p>
                    </>
                )}
            </div>
        </div>
    );
}