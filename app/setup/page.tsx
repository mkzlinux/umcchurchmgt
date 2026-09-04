'use client';

import { FormEvent, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import '../globals.css';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [circuitId, setCircuitId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function createCircuit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const values = new FormData(event.currentTarget);
    const supabase = createClient();
    if (!supabase) { setStep(2); setMessage('Development preview: circuit created. Add its first church below.'); return; }
    const { error: claimError } = await supabase.rpc('claim_first_root');
    if (claimError && !claimError.message.toLowerCase().includes('already exists')) { setError(claimError.message); return; }
    const { data, error: rpcError } = await supabase.rpc('create_first_circuit', { circuit_name: String(values.get('name')), circuit_code: String(values.get('code') || '') });
    if (rpcError) { setError(rpcError.message); return; }
    setCircuitId(data.id); setStep(2); setMessage('Circuit created. Now add its first church.');
  }
  async function createStructure(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const values = new FormData(event.currentTarget);
    const split = (key: string) => String(values.get(key) || '').split(',').map(x => x.trim()).filter(Boolean);
    const supabase = createClient();
    if (!supabase) { setMessage('Development preview: church, preaching points and sections are ready to connect.'); return; }
    const { error: rpcError } = await supabase.rpc('create_church_structure', { target_circuit: circuitId, church_name: String(values.get('church')), church_code: String(values.get('churchCode') || ''), preaching_point_names: split('points'), section_names: split('sections') });
    if (rpcError) { setError(rpcError.message); return; }
    setStep(3); setMessage('Your first church structure is ready.');
  }
  return <main className="setup"><div className="setup-card"><div className="wordmark"><span className="mark"><i /></span><strong>Wesley<span>Link</span></strong></div><em>First-time setup · Step {step} of 3</em>{step === 1 && <><h1>Register your circuit.</h1><p>Create the connection point for your churches, preaching points and sections.</p><form onSubmit={createCircuit}><label>Circuit name<input name="name" placeholder="Goromonzi Circuit" required /></label><label>Circuit code <small>Optional</small><input name="code" placeholder="GOR-001" /></label>{error && <div className="auth-error" role="alert">{error}</div>}<button className="submit" type="submit">Create circuit <span>→</span></button></form></>}{step === 2 && <><h1>Add your first church.</h1><p>Start the circuit structure. You can add more churches and sections later.</p><form onSubmit={createStructure}><label>Local church name<input name="church" placeholder="UMC Goromonzi Church" required /></label><label>Church code <small>Optional</small><input name="churchCode" placeholder="GOR-CH-01" /></label><label>Preaching points <small>Separate names with commas</small><input name="points" placeholder="Acturus, Rusike" /></label><label>Sections <small>Separate names with commas</small><input name="sections" placeholder="Goromonzi Central, Acturus Section" /></label>{error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="success-message" role="status">{message}</div>}<button className="submit" type="submit">Save church structure <span>→</span></button></form></>}{step === 3 && <><h1>Setup complete.</h1><p>Your circuit foundation is ready. Continue to the WesleyLink workspace to invite users and add records.</p>{message && <div className="success-message" role="status">{message}</div>}<a className="submit setup-link" href="/root">Open root workspace <span>→</span></a></>}<a className="back-link" href="/">← Return to sign in</a></div></main>;
}
