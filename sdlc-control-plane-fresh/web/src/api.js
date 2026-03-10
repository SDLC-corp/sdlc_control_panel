const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  return response.json();
}
