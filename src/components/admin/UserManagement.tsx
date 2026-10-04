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
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-danger-soft text-danger-fg border border-danger-border">Admin</span>;
      case 'faculty':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-info-soft text-info-fg border border-info-border">Faculty</span>;
      case 'reviewer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-warning-soft text-warning-fg border border-warning-border">Reviewer</span>;
      case 'examiner':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-success-soft text-success-fg border border-success-border">Examiner</span>;
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
            <h1 className="text-xl font-bold text-ink tracking-tight">
              User & Access Control Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-success-soft text-success-fg border border-success-border">
              <Database className="w-3 h-3 text-success" />
              <span>Firebase Synced</span>
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Manage faculty accounts, assign institutional roles, set usernames/passwords, and configure login authorizations in Firebase.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSaveSampleAccounts}
            disabled={isSavingSample}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-success-fg hover:text-white bg-success-soft hover:bg-success border border-success-accent rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Save and synchronize all sample personnel accounts to Firebase Firestore"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSavingSample ? 'Saving...' : 'Save Sample Accounts to Firebase'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 rounded-xl bg-success-soft border border-success-border text-success-fg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-success shrink-0" />
          <p className="font-medium">{saveSuccessMessage}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, username, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-line bg-background focus:bg-white focus:outline-hidden focus:border-primary-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <span className="text-[11px] text-ink-muted font-medium whitespace-nowrap mr-1">Filter Role:</span>
          {['all', 'admin', 'faculty', 'reviewer', 'examiner'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors capitalize whitespace-nowrap cursor-pointer ${
                roleFilter === r
                  ? 'bg-ink text-white font-semibold shadow-xs'
                  : 'bg-surface-secondary text-ink-secondary hover:bg-line'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[720px]">
            <thead className="font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Login Credentials</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Academic Title & Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-ink-muted">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrentSession = u.id === currentUser.id;
                  const isPassRevealed = revealedPasswords[u.id];

                  return (
                    <tr key={u.id} className="">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-ink">{u.name}</span>
                              {isCurrentSession && (
                                <span className="text-[10px] font-mono text-primary-700 bg-primary-50 border border-primary-200 rounded px-1.5 py-0.2">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <span className="text-ink-muted font-mono text-[11px] block">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Username & Password */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-ink-secondary">
                            <span className="text-ink-muted text-[10px]">User:</span>
                            <span className="font-semibold text-ink bg-surface-secondary px-1.5 py-0.5 rounded text-[11px]">
                              {u.username || u.email.split('@')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-ink-secondary">
                            <span className="text-ink-muted text-[10px]">Pass:</span>
                            <span className="text-[11px] font-medium text-ink-secondary bg-surface-secondary px-1.5 py-0.5 rounded">
                              {isPassRevealed ? (u.password || 'admin123') : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-ink-muted hover:text-ink-secondary p-0.5"
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
                      <td className="py-3.5 px-4 text-ink-secondary">
                        <p className="font-medium text-ink">{u.title}</p>
                        <p className="text-[11px] text-ink-muted">{u.department}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                            u.active
                              ? 'bg-success-soft text-success-fg border-success-border hover:bg-success-soft'
                              : 'bg-surface-secondary text-ink-muted border-line hover:bg-line'
                          }`}
                          title="Click to toggle active status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.active ? 'bg-success' : 'bg-ink-muted'}`} />
                          <span>{u.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-ink-muted hover:text-ink hover:bg-surface-secondary rounded transition-colors cursor-pointer"
                            title="Edit user details and credentials"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrentSession && (
                            <button
                              onClick={() => setDeleteModalUser(u)}
                              className="p-1.5 text-danger hover:text-danger-fg hover:bg-danger-soft rounded transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-line w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between gap-2 p-4 border-b border-line bg-background">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-primary-50 border border-primary-200 text-primary-700 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-ink truncate">
                  {editingUser ? `Edit User: ${editingUser.name}` : 'Create Academic Personnel Account'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-secondary rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
                  Full Name with Academic Degrees *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. John Doe, M.Eng., PECE"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Username (for Login) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jdoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="jdoe@bscpe.edu.ph"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-ink-secondary">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] text-primary-600 hover:text-primary-800 font-semibold flex items-center gap-1 cursor-pointer"
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
                    className="w-full px-3 py-1.5 pr-10 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink-secondary"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">
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
                          ? 'border-primary-600 bg-primary-50/50 text-primary-900 font-semibold'
                          : 'border-line hover:bg-background text-ink-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{r.label}</span>
                        {formData.role === r.role && <Check className="w-3.5 h-3.5 text-primary-600" />}
                      </div>
                      <p className="text-[10px] text-ink-muted mt-0.5 line-clamp-1">
                        {r.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Academic Rank / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Professor"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-secondary mb-1">
                    Department / Division
                  </label>
                  <input
                    type="text"
                    placeholder="Computer Engineering Department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-line focus:outline-hidden focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeUserCheckbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="activeUserCheckbox" className="text-xs text-ink-secondary font-medium">
                  Account is Active and authorized to authenticate
                </label>
              </div>

              <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-white border-t border-line flex flex-wrap items-center justify-end gap-2 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-line w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 p-5 space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <div className="p-2 rounded-full bg-danger-soft border border-danger-soft">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <h3 className="text-sm font-bold text-ink">Delete User Account</h3>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Are you sure you want to permanently delete the account for <strong className="text-ink">{deleteModalUser.name}</strong> ({deleteModalUser.email})? This user will no longer be able to sign in or author questions.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-danger hover:bg-danger-fg rounded-lg transition-colors shadow-xs cursor-pointer"
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
