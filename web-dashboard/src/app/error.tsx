'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Optionally log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[100vh] w-full flex-col items-center justify-center bg-[#F8F9FA] text-center px-4">
            <AlertCircle className="h-24 w-24 text-red-400 mb-8 animate-bounce" />
            <h2 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">Something went wrong</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Try again</Button>
            </div>
        </div>
    );
}
