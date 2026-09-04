'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import '../globals.css';

export default function SetupPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setMessage('');
    const values = new FormData(event.currentTarget);
    const name = String(values.get('name') || '').trim();
    const code = String(values.get('code') || '').trim();
    const supabase = createClient();
    if (!supabase) { setMessage('Development preview: circuit setup is ready for Supabase.'); return; }
    const { error: rpcError } = await supabase.rpc('create_first_circuit', { circuit_name: name, circuit_code: code || null });
    if (rpcError) { setError(rpcError.message); return; }
    setMessage('Circuit created successfully. Your workspace is ready.');
  }
  return <main className="setup"><div className="setup-card"><div className="wordmark"><span className="mark"><i /></span><strong>Wesley<span>Link</span></strong></div><em>First-time setup</em><h1>Register your circuit.</h1><p>Create the first connection point for your churches, preaching points and sections.</p><form onSubmit={submit}><label>Circuit name<input name="name" placeholder="Goromonzi Circuit" required /></label><label>Circuit code <small>Optional</small><input name="code" placeholder="GOR-001" /></label>{error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="success-message" role="status">{message}</div>}<button className="submit" type="submit">Create circuit <span>→</span></button></form><a className="back-link" href="/">← Return to sign in</a></div></main>;
}
