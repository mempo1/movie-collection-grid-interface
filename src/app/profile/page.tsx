'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react'; // Импортируем useEffect
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Переносим перенаправление в useEffect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  // Возвращаем null, пока происходит перенаправление
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8">
      <div className="bg-[#1A1F25] rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-8">Profile</h1>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Username</div>
              <div className="text-lg">{session?.user?.username}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Email</div>
              <div className="text-lg">{session?.user?.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Role</div>
              <div className="text-lg capitalize">{session?.user?.role}</div>
            </div>
          </div>
        </div>

        {session?.user?.role === 'admin' && (
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
            <p className="text-gray-400 mb-4">
              You have administrator privileges. You can manage movies and other content through the admin panel.
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Go to Admin Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
