'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import tr from '@/lib/i18n/tr.json';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: tr.dashboard.title },
    { href: '/generate', label: tr.generate.title },
    { href: '/contents', label: tr.contents.title },
    { href: '/settings', label: tr.settings.title },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Landing Page Generator</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session?.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 hover:text-red-700"
              >
                {tr.auth.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </div>
  );
}

