import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Auth.jsx';
import AuthShell from '../components/AuthShell.jsx';
import Field from '../components/Field.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ organizationName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords don’t match.' });
      return;
    }
    setErrors({}); setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      await signup(payload);
      navigate('/');
    } catch (err) {
      setErrors(err.fields); setError(err.message);
    } finally { setBusy(false); }
  }

  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your organization and start tracking stock."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-brand underline">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && !Object.keys(errors).length && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        <Field label="Organization name" error={errors.organizationName}>
          <input className={cls('organizationName')} placeholder="My Test Store" required value={form.organizationName} onChange={set('organizationName')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className={cls('email')} type="email" autoComplete="email" required value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Password" error={errors.password} hint="At least 8 characters.">
          <input className={cls('password')} type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirmPassword}>
          <input className={cls('confirmPassword')} type="password" autoComplete="new-password" required value={form.confirmPassword} onChange={set('confirmPassword')} />
        </Field>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
