'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import tr from '@/lib/i18n/tr.json';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    completed: 0,
    generating: 0,
  });
  const [recentContents, setRecentContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/contents?limit=5');
      const data = await response.json();
      
      if (data.contents) {
        setRecentContents(data.contents);
        
        // Calculate stats
        const total = data.pagination.total;
        const completed = data.contents.filter((c: any) => c.status === 'completed').length;
        const generating = data.contents.filter((c: any) => c.status === 'generating').length;
        
        setStats({
          total,
          thisMonth: total,
          completed,
          generating,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{tr.dashboard.title}</h2>
        <p className="text-gray-600">{tr.dashboard.welcome}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{tr.dashboard.totalContents}</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{tr.dashboard.thisMonth}</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{tr.dashboard.completed}</h3>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">{tr.dashboard.generating}</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.generating}</p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mb-8">
        <Link
          href="/generate"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {tr.dashboard.newContent}
        </Link>
      </div>

      {/* Recent Contents */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{tr.dashboard.recentContents}</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <p className="text-gray-500">{tr.common.loading}</p>
          ) : recentContents.length === 0 ? (
            <p className="text-gray-500">{tr.contents.noContents}</p>
          ) : (
            <div className="space-y-4">
              {recentContents.map((content: any) => (
                <div key={content._id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div>
                    <h4 className="font-medium text-gray-900">{content.keyword}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(content.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        content.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : content.status === 'generating'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tr.status[content.status as keyof typeof tr.status]}
                    </span>
                    <Link
                      href={`/contents/${content._id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {tr.contents.preview}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

