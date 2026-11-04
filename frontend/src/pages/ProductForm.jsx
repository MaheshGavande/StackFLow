import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import Field from '../components/Field.jsx';

const empty = { name: '', sku: '', description: '', quantityOnHand: '0', costPrice: '', sellingPrice: '', lowStockThreshold: '' };

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.getProduct(id)
      .then(({ product: p }) => setForm({
        name: p.name, sku: p.sku, description: p.description ?? '',
        quantityOnHand: String(p.quantityOnHand),
        costPrice: p.costPrice ?? '', sellingPrice: p.sellingPrice ?? '',
        lowStockThreshold: p.lowStockThreshold ?? '',
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const cls = (k) => `input ${errors[k] ? 'input-error' : ''}`;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(''); setErrors({});
    try {
      if (isEdit) await api.updateProduct(id, form);
      else await api.createProduct(form);
      navigate('/products');
    } catch (err) {
      setErrors(err.fields); setError(err.message);
    } finally { setBusy(false); }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Edit product' : 'Add product'}</h1>
      <form onSubmit={submit} className="panel mt-6 space-y-5 p-6" noValidate>
        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" error={errors.name}><input className={cls('name')} value={form.name} onChange={set('name')} /></Field>
          <Field label="SKU" error={errors.sku}><input className={cls('sku')} value={form.sku} onChange={set('sku')} /></Field>
        </div>

        <Field label="Description (optional)" error={errors.description}>
          <textarea className="input" rows={3} value={form.description} onChange={set('description')} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Quantity on hand" error={errors.quantityOnHand}>
            <input className={cls('quantityOnHand')} type="number" step="1" min="0" value={form.quantityOnHand} onChange={set('quantityOnHand')} />
          </Field>
          <Field label="Low stock threshold" error={errors.lowStockThreshold} hint="Leave empty to use your default from Settings.">
            <input className={cls('lowStockThreshold')} type="number" step="1" min="0" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} />
          </Field>
          <Field label="Cost price" error={errors.costPrice}>
            <input className={cls('costPrice')} type="number" step="0.01" min="0" value={form.costPrice} onChange={set('costPrice')} />
          </Field>
          <Field label="Selling price" error={errors.sellingPrice}>
            <input className={cls('sellingPrice')} type="number" step="0.01" min="0" value={form.sellingPrice} onChange={set('sellingPrice')} />
          </Field>
        </div>

        <div className="flex justify-end gap-2 border-t border-line pt-5">
          <Link to="/products" className="btn-secondary">Cancel</Link>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </div>
  );
}
