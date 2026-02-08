'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import React from 'react';

interface UserStats {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_logins: number;
  total_sessions: number;
  total_downloads: number;
  avg_session_duration: number;
  last_login: string;
  created_at: string;
}

interface Session {
  id: string;
  user_name: string;
  user_email: string;
  started_at: string;
  last_activity: string;
  duration_seconds: number;
  is_active: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'users' | 'sessions'>('users');

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadUsers(), loadSessions()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    // Get all users with their stats
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!usersData) return;

    // Get stats for each user
    const usersWithStats = await Promise.all(
      usersData.map(async (user) => {
        const { data: loginCount } = await supabase
          .from('login_history')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const { data: sessionCount } = await supabase
          .from('user_sessions')
          .select('id, duration_seconds', { count: 'exact' })
          .eq('user_id', user.id);

        const { data: downloadCount } = await supabase
          .from('brochure_downloads')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        const { data: lastLogin } = await supabase
          .from('login_history')
          .select('login_at')
          .eq('user_id', user.id)
          .order('login_at', { ascending: false })
          .limit(1)
          .single();

        const avgDuration = sessionCount?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / (sessionCount?.length || 1);

        return {
          ...user,
          total_logins: loginCount?.length || 0,
          total_sessions: sessionCount?.length || 0,
          total_downloads: downloadCount?.length || 0,
          avg_session_duration: avgDuration || 0,
          last_login: lastLogin?.login_at || user.created_at
        };
      })
    );

    setUsers(usersWithStats);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('user_sessions')
      .select(`
        id,
        started_at,
        last_activity,
        duration_seconds,
        is_active,
        users (name, email)
      `)
      .order('started_at', { ascending: false })
      .limit(50);

    if (data) {
      const formattedSessions = data.map((session: any) => ({
        id: session.id,
        user_name: session.users?.name || 'Unknown',
        user_email: session.users?.email || 'Unknown',
        started_at: session.started_at,
        last_activity: session.last_activity,
        duration_seconds: session.duration_seconds || 0,
        is_active: session.is_active
      }));
      setSessions(formattedSessions);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-gradient-to-r from-gray-900 to-black">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">ASBL Admin</h1>
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Users</h3>
            <p className="text-4xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Active Sessions</h3>
            <p className="text-4xl font-bold text-white">{sessions.filter(s => s.is_active).length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Downloads</h3>
            <p className="text-4xl font-bold text-white">
              {users.reduce((sum, u) => sum + u.total_downloads, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none p-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Logins</h3>
            <p className="text-4xl font-bold text-white">
              {users.reduce((sum, u) => sum + u.total_logins, 0)}
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('users')}
            className={`px-6 py-2 rounded-none font-semibold transition-all border-2 ${
              view === 'users'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white border-white/30 hover:border-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setView('sessions')}
            className={`px-6 py-2 rounded-none font-semibold transition-all border-2 ${
              view === 'sessions'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white border-white/30 hover:border-white'
            }`}
          >
            Sessions
          </button>
        </div>

        {/* Users Table */}
        {view === 'users' && (
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50 border-b border-white/20">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Name</th>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Email</th>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Phone</th>
                    <th className="text-center p-4 text-gray-400 font-semibold uppercase text-sm">Logins</th>
                    <th className="text-center p-4 text-gray-400 font-semibold uppercase text-sm">Sessions</th>
                    <th className="text-center p-4 text-gray-400 font-semibold uppercase text-sm">Downloads</th>
                    <th className="text-center p-4 text-gray-400 font-semibold uppercase text-sm">Avg Duration</th>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{user.name}</td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4 text-gray-300">{user.phone}</td>
                      <td className="p-4 text-center text-white font-semibold">{user.total_logins}</td>
                      <td className="p-4 text-center text-white font-semibold">{user.total_sessions}</td>
                      <td className="p-4 text-center text-white font-semibold">{user.total_downloads}</td>
                      <td className="p-4 text-center text-gray-300">
                        {formatDuration(Math.floor(user.avg_session_duration))}
                      </td>
                      <td className="p-4 text-gray-300 text-sm">{formatDate(user.last_login)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sessions Table */}
        {view === 'sessions' && (
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50 border-b border-white/20">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">User</th>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Email</th>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Started At</th>
                    <th className="text-left p-4 text-gray-400 font-semibold uppercase text-sm">Last Activity</th>
                    <th className="text-center p-4 text-gray-400 font-semibold uppercase text-sm">Duration</th>
                    <th className="text-center p-4 text-gray-400 font-semibold uppercase text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white">{session.user_name}</td>
                      <td className="p-4 text-gray-300">{session.user_email}</td>
                      <td className="p-4 text-gray-300 text-sm">{formatDate(session.started_at)}</td>
                      <td className="p-4 text-gray-300 text-sm">{formatDate(session.last_activity)}</td>
                      <td className="p-4 text-center text-gray-300">
                        {formatDuration(session.duration_seconds)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-none text-xs font-semibold ${
                          session.is_active 
                            ? 'bg-white text-black' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {session.is_active ? 'ACTIVE' : 'ENDED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}