'use client';

import { Gamepad2, User, HelpCircle, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user?.role === 'admin';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="h-[60px] bg-[#1A1F25] border-b border-gray-800">
      <div className="max-w-[1200px] mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold text-white">
            STORM LIVE
          </Link>
          <Gamepad2 className="w-6 h-6 text-gray-400" />
        </div>

        <div className="flex items-center space-x-6">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5 mr-2" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            href="/support"
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            <span>Support</span>
          </Link>

          {session ? (
            <div className="flex items-center space-x-6">
              <Link
                href="/profile"
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <User className="w-5 h-5 mr-2" />
                <span>{session.user.username || session.user.email}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <User className="w-5 h-5 mr-2" />
                <span>Sign In</span>
              </Link>

              <Link
                href="/auth/register"
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
