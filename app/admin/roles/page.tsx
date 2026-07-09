'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { COLORS } from '../../../lib/constants';
import { getRegistry, saveRegistry, type StoredUser, type UserRole } from '../../../lib/users';

const AVAILABLE_ROLES: UserRole[] = ['CANDIDATE', 'RECRUITER', 'SUPERVISOR', 'ADMIN'];

const ROLE_LABELS: Record<UserRole, string> = {
  CANDIDATE: 'Candidat',
  RECRUITER: 'RH',
  SUPERVISOR: 'Superviseur',
  ADMIN: 'Administrateur',
};

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  CANDIDATE: { bg: 'bg-blue-50', text: 'text-blue-700' },
  RECRUITER: { bg: 'bg-purple-50', text: 'text-purple-700' },
  SUPERVISOR: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  ADMIN: { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function AdminRolesPage() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('CANDIDATE');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const registry = getRegistry();
    setUsers(registry);
  };
  const handleRoleChange = (user: StoredUser, newRole: UserRole) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    saveRegistry(updatedUsers);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      saveRegistry(updatedUsers);
    }
  };

  const getRoleColor = (role: UserRole) => ROLE_COLORS[role];

  const getUsersByRole = (role: UserRole) => users.filter((u) => u.role === role);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.midnight }}>
            Gestion des rôles
          </h1>
          <p className="text-gray-600">
            Attribuer et modifier les rôles des utilisateurs
          </p>
        </div>
      </div>

      {/* Roles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {AVAILABLE_ROLES.map((role) => {
          const roleUsers = getUsersByRole(role);
          const color = getRoleColor(role);
          return (
            <div key={role} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.bg}`}>
                  <Shield size={20} className={color.text} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{ROLE_LABELS[role]}</h3>
                  <p className="text-sm text-gray-500">{roleUsers.length} utilisateur(s)</p>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {roleUsers.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun utilisateur</p>
                ) : (
                  roleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          {AVAILABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* All Users Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold" style={{ color: COLORS.midnight }}>
            Tous les utilisateurs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Nom</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Rôle actuel</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const color = getRoleColor(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.nom}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
                      >
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                          {AVAILABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
