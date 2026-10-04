import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  X,
  Check,
  Key,
  Eye,
  EyeOff,
  Search,
  Filter,
  Lock,
  Database,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

const ROLES: { role: Role; label: string; description: string }[] = [
  { role: 'admin', label: 'Administrator', description: 'Full system management, courses, users, and audit logs' },
  { role: 'faculty', label: 'Faculty / Author', description: 'Creates questions, answers, test cases, and exams' },
  { role: 'reviewer', label: 'Reviewer', description: 'Reviews submitted questions, approves or returns with feedback' },
  { role: 'examiner', label: 'Examiner', description: 'Builds examination sets, randomizes versions, exports test papers' },
];

export const UserManagement: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    currentUser,
    isFirebaseConnected,
    saveSampleAccountsToFirebase,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [isSavingSample, setIsSavingSample] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const handleSaveSampleAccounts = async () => {
    setIsSavingSample(true);
    setSaveSuccessMessage(null);
    const success = await saveSampleAccountsToFirebase();
    setIsSavingSample(false);
    if (success) {
      setSaveSuccessMessage('Sample Authorized Personnel Accounts saved and synchronized directly to your Firebase Firestore database!');
      setTimeout(() => setSaveSuccessMessage(null), 6000);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'faculty' as Role,
    department: 'Computer Engineering Department',
    title: 'Assistant Professor',
    active: true,
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      name: '',
      username: '',
      email: '',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Engineering Department',
      title: 'Assistant Professor',
      active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setShowPassword(false);
    setFormData({
      name: user.name,
      username: user.username || '',
      email: user.email,
      password: user.password || 'admin123',
      role: user.role,
      department: user.department,
      title: user.title,
      active: user.active,
    });
    setIsModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: res }));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const payload = {
      name: formData.name.trim(),
      username: (formData.username || formData.email.split('@')[0]).trim().toLowerCase(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password.trim() || 'admin123',
      role: formData.role,
      department: formData.department.trim(),
      title: formData.title.trim(),
      active: formData.active,
    };

    if (editingUser) {
      await updateUser(editingUser.id, payload);
    } else {
      await addUser(payload);
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalUser) return;
    await deleteUser(deleteModalUser.id);
    setDeleteModalUser(null);
  };

  const togglePasswordVisibility = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Admin</span>;
      case 'faculty':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Faculty</span>;
      case 'reviewer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Reviewer</span>;
      case 'examiner':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Examiner</span>;
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              User & Access Control Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Firebase Synced</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage faculty accounts, assign institutional roles, set usernames/passwords, and configure login authorizations in Firebase.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSaveSampleAccounts}
            disabled={isSavingSample}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 border border-emerald-300 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Save and synchronize all sample personnel accounts to Firebase Firestore"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSavingSample ? 'Saving...' : 'Save Sample Accounts to Firebase'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="font-medium">{saveSuccessMessage}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, username, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap mr-1">Filter Role:</span>
          {['all', 'admin', 'faculty', 'reviewer', 'examiner'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors capitalize whitespace-nowrap cursor-pointer ${
                roleFilter === r
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Login Credentials</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Academic Title & Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentSession = u.id === currentUser.id;
                  const isPassRevealed = revealedPasswords[u.id];

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{u.name}</span>
                              {isCurrentSession && (
                                <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.2">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 font-mono text-[11px] block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Username & Password */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-slate-700">
                            <span className="text-slate-400 text-[10px]">User:</span>
                            <span className="font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {u.username || u.email.split('@')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="text-slate-400 text-[10px]">Pass:</span>
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {isPassRevealed ? (u.password || 'admin123') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                              title={isPassRevealed ? 'Hide password' : 'Show password'}
                            >
                              {isPassRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      {/* Title & Department */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <p className="font-medium text-slate-800">{u.title}</p>
                        <p className="text-[11px] text-slate-400">{u.department}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            u.active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle active status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          <span>{u.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit user details and credentials"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrentSession && (
                            <button
                              onClick={() => setDeleteModalUser(u)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 truncate">
                  {editingUser ? `Edit User: ${editingUser.name}` : 'Create Academic Personnel Account'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name with Academic Degrees *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. John Doe, M.Eng., PECE"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username (for Login) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jdoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jdoe@bscpe.edu.ph"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Generate Secure Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-1.5 pr-10 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Role *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.role })}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        formData.role === r.role
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{r.label}</span>
                        {formData.role === r.role && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {r.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Rank / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Professor"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    placeholder="Computer Engineering Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeUserCheckbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="activeUserCheckbox" className="text-xs text-slate-700 font-medium">
                  Account is Active and authorized to authenticate
                </label>
              </div>

              <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-end gap-2 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {editingUser ? 'Save User Changes' : 'Create User in Firebase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-full bg-rose-50 border border-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Delete User Account</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the account for <strong className="text-slate-900">{deleteModalUser.name}</strong> ({deleteModalUser.email})? This user will no longer be able to sign in or author questions.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Delete from Firebase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
