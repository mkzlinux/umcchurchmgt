'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function RootActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    const supabase = createClient();
    if (!supabase) { setError('Connect Supabase to register a live circuit.'); setSaving(false); return; }
    const { error: createError } = await supabase.rpc('create_first_circuit', { circuit_name: name, circuit_code: code || null });
    if (createError) { setError(createError.message); setSaving(false); return; }
    setName(''); setCode(''); setOpen(false); setSaving(false); router.refresh();
  }
  return <>{open ? <form className="root-form" onSubmit={submit}><div><label>Circuit name<input value={name} onChange={e => setName(e.target.value)} placeholder="Goromonzi Circuit" required /></label><label>Circuit code<input value={code} onChange={e => setCode(e.target.value)} placeholder="GOR-001" /></label></div>{error && <div className="auth-error">{error}</div>}<div className="root-form-actions"><button type="button" className="cancel" onClick={() => setOpen(false)}>Cancel</button><button className="action" disabled={saving}>{saving ? 'Creating…' : 'Create circuit →'}</button></div></form> : <button className="action root-action" onClick={() => setOpen(true)}>＋ Register circuit</button>}</>;
}
