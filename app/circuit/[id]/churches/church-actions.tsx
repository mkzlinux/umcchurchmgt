'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';

export default function ChurchActions({ circuitId }: { circuitId: string }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [name, setName] = useState(''); const [code, setCode] = useState(''); const [points, setPoints] = useState(''); const [sections, setSections] = useState(''); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); setError(''); const supabase = createClient(); if (!supabase) { setError('Connect Supabase to add a live church.'); setSaving(false); return; } const split = (value: string) => value.split(',').map(x => x.trim()).filter(Boolean); const { error: rpcError } = await supabase.rpc('create_church_structure', { target_circuit: circuitId, church_name: name, church_code: code || null, preaching_point_names: split(points), section_names: split(sections) }); if (rpcError) { setError(rpcError.message); setSaving(false); return; } setOpen(false); setName(''); setCode(''); setPoints(''); setSections(''); setSaving(false); router.refresh(); }
  if (!open) return <button className="action" onClick={() => setOpen(true)}>＋ Add church</button>;
  return <form className="root-form church-form" onSubmit={submit}><div><label>Local church<input value={name} onChange={e => setName(e.target.value)} placeholder="UMC Goromonzi Church" required /></label><label>Code<input value={code} onChange={e => setCode(e.target.value)} placeholder="GOR-CH-01" /></label></div><label>Preaching points <small>Separate with commas</small><input value={points} onChange={e => setPoints(e.target.value)} placeholder="Acturus, Rusike" /></label><label>Sections <small>Separate with commas</small><input value={sections} onChange={e => setSections(e.target.value)} placeholder="Goromonzi Central, Acturus Section" /></label>{error && <div className="auth-error">{error}</div>}<div className="root-form-actions"><button type="button" className="cancel" onClick={() => setOpen(false)}>Cancel</button><button className="action" disabled={saving}>{saving ? 'Saving…' : 'Save church →'}</button></div></form>;
}
