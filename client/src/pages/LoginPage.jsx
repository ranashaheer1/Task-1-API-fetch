import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('staff@example.com');
  const [password, setPassword] = useState('password');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!loading && isAuthenticated) {
    return <Navigate to={location.state?.from || '/shop'} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    if (!email.trim() || !password) {
      setFormError('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Logged in successfully');
      navigate(location.state?.from || '/shop', { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setFormError(err.friendlyMessage || getErrorMessage(err, 'Login failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-12 lg:px-6">
      <div className="grid w-full gap-10 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">Access</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Staff login</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">
            The Management API authenticates admin and staff users only. Customer registration,
            password reset, and guest browsing are not documented.
          </p>
          <div className="mt-6 rounded-2xl border border-ink/8 bg-white/60 p-4 text-xs text-ink/60">
            <p className="font-semibold text-ink">Demo credentials</p>
            <p className="mt-2">admin@example.com / password</p>
            <p>staff@example.com / password</p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(20,24,22,0.5)] md:p-8"
        >
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none ring-sea/30 focus:ring-2"
            />
            {fieldErrors.email ? (
              <span className="mt-1 block text-xs text-danger">{fieldErrors.email[0]}</span>
            ) : null}
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none ring-sea/30 focus:ring-2"
            />
            {fieldErrors.password ? (
              <span className="mt-1 block text-xs text-danger">{fieldErrors.password[0]}</span>
            ) : null}
          </label>
          {formError ? <p className="mt-4 text-sm text-danger">{formError}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-4 text-center text-xs text-ink/50">
            No register endpoint —{' '}
            <Link to="/register" className="text-sea underline">
              see details
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
