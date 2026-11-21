import React, { useCallback, useEffect, useState } from 'react';
import { api } from './api/client';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website',
  status: 'New',
};

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lm_user')) || null;
    } catch {
      return null;
    }
  });
  const [leads, setLeads] = useState([]);
  const [counts, setCounts] = useState({ Total: 0, New: 0, Contacted: 0, Qualified: 0, Lost: 0 });
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [saving, setSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.getLeads({ search, status: statusFilter, sort, page, limit: 10 });
      setLeads(response.data || []);
      setCounts(response.counts || { Total: 0, New: 0, Contacted: 0, Qualified: 0, Lost: 0 });
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 });
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('lm_token');
        localStorage.removeItem('lm_user');
        setUser(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, search, statusFilter, sort, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const authenticate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response =
        authMode === 'register'
          ? await api.register(auth)
          : await api.login({ email: auth.email, password: auth.password });
      localStorage.setItem('lm_token', response.token);
      localStorage.setItem('lm_user', JSON.stringify(response.user));
      setUser(response.user);
      setAuth({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const demoLogin = async () => {
    setError('');
    try {
      const response = await api.demoLogin();
      localStorage.setItem('lm_token', response.token);
      localStorage.setItem('lm_user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('lm_token');
    localStorage.removeItem('lm_user');
    setUser(null);
  };

  const saveLead = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingId) {
        await api.updateLead(editingId, form);
      } else {
        await api.createLead(form);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await fetchLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editLead = (lead) => {
    setEditingId(lead._id);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      status: lead.status,
    });
  };

  const deleteLead = async (id) => {
    const lead = leads.find((item) => item._id === id);
    if (!lead || !window.confirm(`Delete ${lead.name} from ${lead.company}?`)) return;
    setError('');
    try {
      await api.deleteLead(id);
      await fetchLeads();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    setError('');
    try {
      await api.updateLeadStatus(id, status);
      await fetchLeads();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <main className="app-shell min-h-screen flex items-center justify-center p-6">
        <form onSubmit={authenticate} className="glass-panel w-full max-w-md rounded-3xl p-8">
          <h1 className="brand-type mb-2 rounded-xl bg-gradient-to-r from-red-600 via-red-700 to-rose-600 px-4 py-3 text-2xl font-bold text-white shadow-[0_12px_24px_rgba(220,38,38,0.30)]">Lead Manager</h1>
          <p className="text-slate-500 mb-6">Sign in to manage your sales pipeline.</p>
          {error && <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
          {authMode === 'register' && (
            <input
              className="depth-input w-full mb-3 rounded-lg border p-3"
              placeholder="Name"
              value={auth.name}
              onChange={(event) => setAuth({ ...auth, name: event.target.value })}
              required
            />
          )}
          <input
            className="depth-input w-full mb-3 rounded-lg border p-3"
            type="email"
            placeholder="Email"
            value={auth.email}
            onChange={(event) => setAuth({ ...auth, email: event.target.value })}
            required
          />
          <input
            className="depth-input w-full mb-4 rounded-lg border p-3"
            type="password"
            placeholder="Password"
            value={auth.password}
            onChange={(event) => setAuth({ ...auth, password: event.target.value })}
            required
          />
          <button className="depth-button w-full rounded-lg bg-gradient-to-r from-red-600 to-rose-600 p-3 font-semibold text-white">
            {authMode === 'register' ? 'Create account' : 'Sign in'}
          </button>
          <div className="mt-4 flex justify-between text-sm">
            <button type="button" className="text-red-700 hover:text-red-800" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
              {authMode === 'login' ? 'Create account' : 'Back to sign in'}
            </button>
            <button type="button" className="text-red-700 hover:text-red-800" onClick={demoLogin}>Demo login</button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="app-shell min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-x-0 border-t-0 bg-gradient-to-r from-red-600 via-red-700 to-rose-600 px-6 py-4 text-white shadow-[0_10px_28px_rgba(220,38,38,0.28)]">
        <h1 className="brand-type text-xl font-bold">Lead Manager</h1>
        <div className="flex items-center gap-4 text-sm">
          <span>{user.name}</span>
          <button onClick={logout} className="depth-card rounded-lg border bg-white px-3 py-2 text-red-700">Logout</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6">
        {error && <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {Object.entries(counts).map(([label, value]) => (
            <button
              type="button"
              key={label}
              onClick={() => {
                setStatusFilter(label === 'Total' ? '' : label);
                setPage(1);
              }}
              className={`depth-card rounded-xl border bg-white p-4 text-left ${statusFilter === (label === 'Total' ? '' : label) ? 'ring-2 ring-red-500' : ''}`}
            >
              <div className="eyebrow-type text-slate-500">{label}</div>
              <div className="display-type numeric-type text-3xl font-bold text-slate-900">{value}</div>
            </button>
          ))}
        </section>

        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <input
            className="depth-input rounded-lg border p-3"
            placeholder="Search name, email, or company"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="depth-input rounded-lg border p-3"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {['New', 'Contacted', 'Qualified', 'Lost'].map((status) => <option key={status}>{status}</option>)}
          </select>
          <select
            className="depth-input rounded-lg border p-3"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </section>

        <form onSubmit={saveLead} className="glass-panel mb-6 rounded-2xl p-4 grid gap-3 md:grid-cols-3">
          {[
            ['name', 'Name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['company', 'Company'],
          ].map(([field, placeholder]) => (
            <input
              key={field}
              className="depth-input rounded-lg border p-3"
              type={field === 'email' ? 'email' : 'text'}
              placeholder={placeholder}
              value={form[field]}
              onChange={(event) => setForm({ ...form, [field]: event.target.value })}
              required
            />
          ))}
          <select className="depth-input rounded-lg border p-3" value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })}>
            {['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Event', 'Other'].map((source) => <option key={source}>{source}</option>)}
          </select>
          <select className="depth-input rounded-lg border p-3" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            {['New', 'Contacted', 'Qualified', 'Lost'].map((status) => <option key={status}>{status}</option>)}
          </select>
          <button disabled={saving} className="depth-button rounded-lg bg-gradient-to-r from-red-600 to-rose-600 p-3 font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving...' : editingId ? 'Update lead' : 'Add lead'}
          </button>
        </form>

        <div className="glass-panel overflow-x-auto rounded-2xl">
          <table className="w-full text-sm">
            <thead className="table-heading-type border-b bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Company</th>
                <th className="p-3">Source</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-6 text-center" colSpan="7">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td className="p-6 text-center" colSpan="7">No leads found</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead._id} className="border-t">
                  <td className="p-3 font-medium">{lead.name}</td>
                  <td className="p-3">{lead.email}</td>
                  <td className="p-3">{lead.phone}</td>
                  <td className="p-3">{lead.company}</td>
                  <td className="p-3">{lead.source}</td>
                  <td className="p-3">
                    <select className="rounded border p-1" value={lead.status} onChange={(event) => updateStatus(lead._id, event.target.value)}>
                      {['New', 'Contacted', 'Qualified', 'Lost'].map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button onClick={() => editLead(lead)} className="mr-2 text-red-700">Edit</button>
                    <button onClick={() => deleteLead(lead._id)} className="text-rose-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} leads)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border bg-white px-3 py-2 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border bg-white px-3 py-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
