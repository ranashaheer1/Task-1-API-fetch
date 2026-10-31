import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  if (!loading && isAuthenticated) {
    return <Navigate to="/shop" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});
    if (!name.trim() || !email.trim() || !password) {
      setFormError('Name, email and password are required.');
      return;
    }
    if (password !== passwordConfirmation) {
      setFormError('Password confirmation does not match.');
      return;
    }
    setSubmitting(true);
    try {
      // API: POST /auth/register — not documented in Postman (live API returns 404)
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success('Registered successfully');
      navigate('/shop', { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setFormError(
        err.friendlyMessage ||
          getErrorMessage(
            err,
            'Register endpoint is not available on this Laravel API (see Postman).'
          )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-12 lg:px-6">
      <div className="grid w-full gap-10 md:grid-cols-2">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">Access</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Register</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/65">
            Attempts <code className="rounded bg-sand px-1">POST /auth/register</code>. That route
            is not in <code className="rounded bg-sand px-1">postman_collection.json</code> and
            currently returns 404 on the live API. Use Login with demo staff/admin accounts for
            functional testing.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-ink/8 bg-white/80 p-6 shadow-[0_20px_50px_-30px_rgba(20,24,22,0.5)] md:p-8"
        >
          <label className="block text-sm font-medium">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none ring-sea/30 focus:ring-2"
            />
            {fieldErrors.name ? (
              <span className="mt-1 block text-xs text-danger">{fieldErrors.name[0]}</span>
            ) : null}
          </label>
          <label className="mt-4 block text-sm font-medium">
            Email
            <input
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none ring-sea/30 focus:ring-2"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Confirm password
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none ring-sea/30 focus:ring-2"
            />
          </label>
          {formError ? <p className="mt-4 text-sm text-danger">{formError}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Create account'}
          </button>
          <p className="mt-4 text-center text-xs text-ink/50">
            Already have access?{' '}
            <Link to="/login" className="text-sea underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
