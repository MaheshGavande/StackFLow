import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Field from '../components/Field.jsx';

export default function Settings() {
  const [value, setValue] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then(({ settings }) => setValue(String(settings.defaultLowStockThreshold)))
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(''); setErrors({}); setSaved(false);
    try {
      await api.updateSettings({ defaultLowStockThreshold: value });
      setSaved(true);
    } catch (err) { setErrors(err.fields); setError(err.message); }
  }

  if (!loaded) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <form onSubmit={submit} className="panel mt-6 space-y-5 p-6">
        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        {saved && <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-brand">Settings saved.</p>}
        <Field
          label="Default low stock threshold"
          error={errors.defaultLowStockThreshold}
          hint="Products without their own threshold are flagged when quantity is at or below this number."
        >
          <input className={`input ${errors.defaultLowStockThreshold ? 'input-error' : ''}`} type="number" step="1" min="0"
                 value={value} onChange={(e) => { setValue(e.target.value); setSaved(false); }} />
        </Field>
        <button className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
