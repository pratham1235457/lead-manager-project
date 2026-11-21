import React, { useState } from 'react';
import { Briefcase, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function AuthModal({ onAuthenticated }) {
const [mode, setMode] = useState('login'); // 'login' | 'register'
const [form, setForm] = useState({ name: '', email: '', password: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setLoading(true);
try {
const res =
mode === 'login'
? await api.login({ email: form.email, password: form.password })
: await api.register(form);
localStorage.setItem('lm_token', res.token);
localStorage.setItem('lm_user', JSON.stringify(res.user));
onAuthenticated(res.user);
} catch (err) {
setError(err.message || 'Authentication failed');
} finally {
setLoading(false);
}
};

const handleDemo = async () => {
setError('');
setLoading(true);
try {
const res = await api.demoLogin();
localStorage.setItem('lm_token', res.token);
localStorage.setItem('lm_user', JSON.stringify(res.user));
onAuthenticated(res.user);
} catch (err) {
setError(err.message || 'Demo login failed');
} finally {
setLoading(false);
}
};

return (







Lead Manager
Meru Technosoft Sales Pipeline

    <button
      type="button"
      onClick={handleDemo}
      disabled={loading}
      className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-sm border border-indigo-200 transition-colors"
    >
      <Sparkles className="w-4 h-4" />
      Continue with 1-Click Demo Account
    </button>

    <div className="relative flex py-2 items-center mb-5">
      <div className="grow border-t border-slate-200"></div>
      <span className="shrink mx-3 text-xs uppercase text-slate-400">or sign in with email</span>
      <div className="grow border-t border-slate-200"></div>
    </div>

    {error && (
      <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Pratham Gupta"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors disabled:opacity-50"
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
      </button>
    </form>

    <p className="text-center text-xs text-slate-500 mt-5">
      {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError('');
        }}
        className="text-indigo-600 font-semibold hover:underline"
      >
        {mode === 'login' ? 'Sign up' : 'Sign in'}
      </button>
    </p>
  </div>
</div>
);
}