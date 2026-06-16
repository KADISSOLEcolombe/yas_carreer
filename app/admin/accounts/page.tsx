'use client';

import React, { useState, useEffect } from 'react';
import { UserX, Search, Filter, Eye, EyeOff, Mail, Shield } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getRegistry, saveRegistry, type StoredUser, type UserRole } from '../../../lib/users';

const ROLE_LABELS: Record<UserRole, string> = {
  CANDIDATE: 'Candidat',
  RECRUITER: 'RH',
  ADMIN: 'Administrateur',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  CANDIDATE: { bg: 'bg-blue-50', text: 'text-blue-700' },
  RECRUITER: { bg: 'bg-purple-50', text: 'text-purple-700' },
  ADMIN: { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function AdminAccountsPage() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'ALL' | UserRole>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const registry = getRegistry();
    setUsers(registry);
  };

  const handleToggleActive = (user: StoredUser) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, active: u.active === undefined ? false : !u.active } : u
    );
    setUsers(updatedUsers);
    saveRegistry(updatedUsers);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Supprimer définitivement cet utilisateur ?')) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      saveRegistry(updatedUsers);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    const isActive = user.active !== false;
    const matchesStatus = 
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && isActive) ||
      (filterStatus === 'INACTIVE' && !isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: UserRole) => ROLE_COLORS[role];

  const activeCount = users.filter((u) => u.active !== false).length;
  const inactiveCount = users.filter((u) => u.active === false).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
            Gestion des comptes
          </h1>
          <p className="text-gray-600">
            Activer, désactiver et supprimer les comptes utilisateur
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: COLORS.midnight }}>
                {users.length}
              </div>
              <div className="text-sm text-gray-600">Total comptes</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
              <Eye size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <div className="text-sm text-gray-600">Comptes actifs</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50">
              <EyeOff size={20} className="text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{inactiveCount}</div>
              <div className="text-sm text-gray-600">Comptes désactivés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un nom ou email"
              className="flex-1 outline-none text-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="outline-none text-gray-900 bg-transparent"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'ALL' | UserRole)}
            >
              <option value="ALL">Tous les rôles</option>
              <option value="CANDIDATE">Candidats</option>
              <option value="RECRUITER">RH</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="outline-none text-gray-900 bg-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="INACTIVE">Désactivés</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Utilisateur</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Rôle</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isActive = user.active !== false;
                  const roleColor = getRoleColor(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: COLORS.midnight }}>
                            {user.nom.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.nom}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text}`}
                        >
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {isActive ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                            title={isActive ? 'Désactiver' : 'Activer'}
                          >
                            {isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="Supprimer"
                          >
                            <UserX size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
