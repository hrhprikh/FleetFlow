import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-[100vh] w-full flex-col items-center justify-center bg-[#F8F9FA] text-center px-4">
            <Ghost className="h-24 w-24 text-gray-300 mb-8 animate-pulse" />
            <h2 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">404 - Page Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                We couldn't find the page you were looking for. It might have been moved or deleted.
            </p>
            <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
        </div>
    );
}
