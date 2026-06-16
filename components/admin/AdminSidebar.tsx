'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  UserX, 
  LogOut,
  Menu,
  X,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../lib/constants';

export default function AdminSidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Tableau de bord',
    },
    {
      href: '/admin/roles',
      icon: Shield,
      label: 'Gérer les rôles',
    },
    {
      href: '/admin/accounts',
      icon: Users,
      label: 'Gérer les comptes',
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: COLORS.yellow }}
            >
              YT
            </div>
            <div>
              <span className="font-bold text-sm" style={{ color: COLORS.midnight }}>
                YAS Togo
              </span>
              <span className="text-xs text-gray-500 block">Administrateur</span>
            </div>
          </div>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center space-x-3 px-6 py-4 border-b border-gray-200">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: COLORS.yellow }}
            >
              YT
            </div>
            <div>
              <span className="font-bold" style={{ color: COLORS.midnight }}>
                YAS Togo
              </span>
              <span className="text-xs text-gray-500 block">Administration</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-gray-200 px-4 py-4">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: COLORS.midnight }}>
                {user?.nom?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nom || 'Administrateur'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@yastogo.tg'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
