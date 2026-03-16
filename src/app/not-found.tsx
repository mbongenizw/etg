import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-100 p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="p-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 shadow-2xl">
            <AlertTriangle className="h-24 w-24 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-amber-900">404</h1>
          <h2 className="text-3xl font-semibold text-amber-800">Page Not Found</h2>
          <p className="text-lg text-amber-700 max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-8 py-6 text-lg shadow-lg"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Dashboard
            </Link>
          </Button>
          
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-amber-700 text-amber-800 hover:bg-amber-100 px-8 py-6 text-lg shadow-lg"
          >
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" />
              Go to Login
            </Link>
          </Button>
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md border border-amber-200">
          <h3 className="text-xl font-semibold text-amber-900 mb-3">Troubleshooting Tips:</h3>
          <ul className="text-left text-amber-800 space-y-2 max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Check the URL spelling and capitalization</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Click the links in the navigation menu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Try using the search function if available</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Contact support if you continue to experience issues</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
