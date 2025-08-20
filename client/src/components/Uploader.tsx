import React, { useState } from 'react';

type Props = {
  apiBase?: string;        // ex: http://localhost:5000
  prefix?: string;         // ex: "market" | "avatars"
  onUploaded?: (r: { url: string; path: string }) => void;
};

export default function Uploader({ apiBase = 'http://localhost:5000', prefix = 'uploads', onUploaded }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('prefix', prefix);

      const res = await fetch(`${apiBase}/uploads`, { method: 'POST', body: form, credentials: 'include' });
      if (!res.ok) throw new Error('Upload échoué');
      const data = await res.json();
      onUploaded?.(data);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="uploader">
      <input type="file" onChange={handleChange} disabled={loading} />
      {loading ? 'Envoi...' : 'Choisir un fichier'}
    </label>
  );
}
