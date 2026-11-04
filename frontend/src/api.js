const TOKEN_KEY = 'stockflow_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Can’t reach the server. Check that the backend is running.', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(data.error || 'Something went wrong.', res.status, data.fields);
  }
  return data;
}

export const api = {
  signup: (b) => request('POST', '/auth/signup', b),
  login: (b) => request('POST', '/auth/login', b),
  me: () => request('GET', '/user/profile'),
  dashboard: () => request('GET', '/dashboard'),
  listProducts: (search = '') => request('GET', `/products?search=${encodeURIComponent(search)}`),
  getProduct: (id) => request('GET', `/products/${id}`),
  createProduct: (b) => request('POST', '/products', b),
  updateProduct: (id, b) => request('PUT', `/products/${id}`, b),
  adjustStock: (id, delta) => request('POST', `/products/${id}/adjust`, { delta }),
  deleteProduct: (id) => request('DELETE', `/products/${id}`),
  getSettings: () => request('GET', '/settings'),
  updateSettings: (b) => request('PUT', '/settings', b),
};
