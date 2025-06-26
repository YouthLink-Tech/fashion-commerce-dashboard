'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';

export default function AccountDeletedPage() {
  const router = useRouter();

  useEffect(() => {
    const logoutCompletely = async () => {
      try {
        await axios.post("https://fc-backend-664306765395.asia-south1.run.app/logout", null, {
          withCredentials: true,
        });
      } catch (err) {
        console.error("Logout failed", err);
      }

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
