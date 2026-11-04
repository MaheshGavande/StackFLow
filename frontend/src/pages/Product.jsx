import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const money = (v) => (v == null ? '—' : v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export default function Products() {
  const [products, setProducts] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState(null); // { id, value }
  const [confirmId, setConfirmId] = useState(null);

  // Debounced server-side search by name or SKU.
  useEffect(() => {
    const t = setTimeout(() => {
      api.listProducts(search).then((r) => { setProducts(r.products); setError(''); }).catch((e) => setError(e.message));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const replace = (p) => setProducts((list) => list.map((x) => (x.id === p.id ? p : x)));

  async function applyAdjust() {
    try {
      const { product } = await api.adjustStock(adjusting.id, Number(adjusting.value));
      replace(product); setAdjusting(null); setError('');
    } catch (e) { setError(e.message); }
  }

  async function remove(id) {
    try {
      await api.deleteProduct(id);
      setProducts((list) => list.filter((p) => p.id !== id));
      setConfirmId(null); setError('');
    } catch (e) { setError(e.message); }
  }

  const confirming = products?.find((p) => p.id === confirmId);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Link to="/products/new" className="btn-primary">Add product</Link>
      </div>

      <input
        className="input mt-5 max-w-sm"
        type="search"
        placeholder="Search by name or SKU"
        aria-label="Search products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="panel mt-4 overflow-x-auto">
        {!products ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            {search ? `No products match “${search}”.` : 'No products yet. Add one to start tracking stock.'}
          </p>
        ) : (
          <table className="w-full">
            <thead className="border-b border-line">
              <tr>
                <th className="th">Name</th><th className="th">SKU</th>
                <th className="th text-right">Quantity</th><th className="th">Status</th>
                <th className="th text-right">Selling price</th><th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="td font-medium"><Link to={`/products/${p.id}`} className="hover:underline">{p.name}</Link></td>
                  <td className="td text-muted">{p.sku}</td>
                  <td className="td text-right">
                    {adjusting?.id === p.id ? (
                      <span className="inline-flex items-center gap-1">
                        <input
                          autoFocus
                          type="number"
                          step="1"
                          aria-label={`Change in units for ${p.name}`}
                          placeholder="+5 or -3"
                          className="input w-24 py-1"
                          value={adjusting.value}
                          onChange={(e) => setAdjusting({ id: p.id, value: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') applyAdjust(); if (e.key === 'Escape') setAdjusting(null); }}
                        />
                        <button className="btn-primary px-2 py-1" onClick={applyAdjust}>Apply</button>
                        <button className="btn-secondary px-2 py-1" onClick={() => setAdjusting(null)}>Cancel</button>
                      </span>
                    ) : p.quantityOnHand}
                  </td>
                  <td className="td">
                    {p.isLowStock
                      ? <span className="rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">Low stock</span>
                      : <span className="text-xs text-muted">In stock</span>}
                  </td>
                  <td className="td text-right">{money(p.sellingPrice)}</td>
                  <td className="td whitespace-nowrap text-right">
                    <button className="text-sm font-medium text-brand hover:underline" onClick={() => setAdjusting({ id: p.id, value: '' })}>Adjust stock</button>
                    <Link to={`/products/${p.id}`} className="ml-4 text-sm font-medium hover:underline">Edit</Link>
                    <button className="ml-4 text-sm font-medium text-danger hover:underline" onClick={() => setConfirmId(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="panel w-full max-w-sm p-6">
            <h2 id="del-title" className="text-lg font-semibold">Delete {confirming.name}?</h2>
            <p className="mt-2 text-sm text-muted">This removes the product and its stock count permanently.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setConfirmId(null)}>Keep product</button>
              <button className="btn-danger" onClick={() => remove(confirming.id)}>Delete product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}