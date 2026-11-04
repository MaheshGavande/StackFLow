import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p role="alert" className="text-danger">{error}</p>;
  if (!data) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-muted">Products</p>
          <p className="mt-1 text-3xl font-semibold">{data.totalProducts.toLocaleString()}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-muted">Units on hand</p>
          <p className="mt-1 text-3xl font-semibold">{data.totalUnits.toLocaleString()}</p>
        </div>
        <div className={`panel p-5 ${data.lowStock.length ? 'border-warn bg-warn-soft' : ''}`}>
          <p className="text-sm text-muted">Low stock</p>
          <p className={`mt-1 text-3xl font-semibold ${data.lowStock.length ? 'text-warn' : ''}`}>{data.lowStock.length}</p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Low stock items</h2>
        <div className="panel mt-3 overflow-x-auto">
          {data.lowStock.length === 0 ? (
            <p className="p-6 text-sm text-muted">
              {data.totalProducts === 0
                ? <>No products yet. <Link to="/products/new" className="font-medium text-brand underline">Add your first product</Link>.</>
                : 'Nothing is running low right now.'}
            </p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-line">
                <tr><th className="th">Name</th><th className="th">SKU</th><th className="th text-right">On hand</th><th className="th text-right">Threshold</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.lowStock.map((p) => (
                  <tr key={p.id}>
                    <td className="td font-medium"><Link to={`/products/${p.id}`} className="hover:underline">{p.name}</Link></td>
                    <td className="td text-muted">{p.sku}</td>
                    <td className="td text-right font-medium text-warn">{p.quantityOnHand}</td>
                    <td className="td text-right text-muted">{p.lowStockThreshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
