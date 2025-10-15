'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';
import { BACKEND_URL } from '@/app/config/config';

export default function AccountDeletedPage() {
  const router = useRouter();

  useEffect(() => {
    const logoutCompletely = async () => {
      try {
        await axios.post(`${BACKEND_URL}/api/user-access/logout`, null, {
          withCredentials: true,
        });
      } catch (err) {
        console.error("Logout failed", err);
      }

      localStorage.removeItem("initialPage");
      await signOut({ redirect: false });
      router.replace("/auth/restricted-access")
    };

    logoutCompletely();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Account Not Found</h1>
      <p className="text-gray-700 mb-2">
        Your account may have been deleted or access was revoked.
      </p>
      <p className="text-sm text-gray-500">Logging you out...</p>
    </div>
  );
}
