import React, { useState, useEffect } from 'react';
import { api } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import EmptyState from '../components/EmptyState';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  GraduationCap, 
  Trash2, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User, 
  Building2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Create User Modal / Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('Computer Science');
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are required.');
      return;
    }

    setCreating(true);
    try {
      await api.createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        department: department.trim()
      });

      setSuccess(`Account for ${name} (${role}) created successfully!`);
      setShowCreateModal(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to delete user account "${userName}"?`)) return;

    try {
      await api.deleteUser(id);
      setSuccess(`User "${userName}" deleted successfully.`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  // Stats calculation
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalFaculty = users.filter(u => u.role === 'faculty').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            User Accounts Management
          </h1>
          <p className="text-sm text-vault-textMuted mt-1">
            Provision roles, manage student and faculty permissions, and oversee institutional access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl bg-vault-card border border-vault-border text-vault-text hover:text-white transition-colors"
            title="Refresh user list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-vault-violet to-vault-cyan text-white text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-vault-violet/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-vault-card border border-vault-border shadow-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-vault-textMuted">Total Users</div>
          <div className="text-2xl font-extrabold text-white mt-2">{users.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-vault-card border border-vault-border shadow-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-vault-cyan">Students</div>
          <div className="text-2xl font-extrabold text-vault-cyanLight mt-2">{totalStudents}</div>
        </div>
        <div className="p-5 rounded-2xl bg-vault-card border border-vault-border shadow-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-vault-violetLight">Faculty</div>
          <div className="text-2xl font-extrabold text-vault-violetLight mt-2">{totalFaculty}</div>
        </div>
        <div className="p-5 rounded-2xl bg-vault-card border border-vault-border shadow-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Admins</div>
          <div className="text-2xl font-extrabold text-amber-300 mt-2">{totalAdmins}</div>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="p-6 rounded-3xl bg-vault-card border border-vault-border shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-vault-border/60">
          <h3 className="text-base font-bold text-white font-heading">
            Registered Accounts Directory
          </h3>
          <span className="text-xs text-vault-textMuted">
            Showing all accounts in database
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving accounts directory..." />
        ) : users.length === 0 ? (
          <EmptyState title="No registered accounts found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-vault-border text-vault-textMuted uppercase tracking-wider">
                  <th className="py-3 px-3">User & Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Submissions</th>
                  <th className="py-3 px-3">Joined Date</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-border/60 text-vault-text">
                {users.map((u) => {
                  const roleBadge = 
                    u.role === 'student' ? 'text-vault-cyan bg-vault-cyan/10 border-vault-cyan/30' :
                    u.role === 'faculty' ? 'text-vault-violetLight bg-vault-violet/10 border-vault-violet/30' :
                    'text-amber-400 bg-amber-500/10 border-amber-500/30';

                  return (
                    <tr key={u.id} className="hover:bg-vault-cardHover transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-white">{u.name}</div>
                        <div className="text-[11px] text-vault-textMuted">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-vault-textMuted whitespace-nowrap">
                        {u.department || '—'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-vault-textMuted">
                        {u.role === 'student' ? `${u.ideas_count || 0} ideas` : `${u.projects_count || 0} projects`}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-vault-textMuted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-vault-textMuted hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete user account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-vault-card border border-vault-border p-6 sm:p-8 space-y-5 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Create New User Account
              </h3>
              <p className="text-xs text-vault-textMuted mt-1">
                Enter user details and assign an institutional role.
              </p>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-vault-textMuted uppercase mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-white text-xs focus:outline-none focus:border-vault-cyan transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vault-textMuted uppercase mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@ideavault.edu"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-white text-xs focus:outline-none focus:border-vault-cyan transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vault-textMuted uppercase mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-white text-xs focus:outline-none focus:border-vault-cyan transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-vault-textMuted uppercase mb-1.5">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-white text-xs focus:outline-none focus:border-vault-cyan"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-vault-textMuted uppercase mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-white text-xs focus:outline-none focus:border-vault-cyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-vault-border/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-vault-bg border border-vault-border text-vault-text text-xs hover:bg-vault-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-vault-violet to-vault-cyan text-white text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-vault-violet/20"
                >
                  {creating ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
