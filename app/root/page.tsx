import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import '../globals.css';

export default async function RootWorkspace() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');
    const { data: root } = await supabase.from('platform_memberships').select('user_id').eq('user_id', user.id).maybeSingle();
    if (!root) redirect('/');
  }
  const circuits = supabase ? (await supabase.from('circuits').select('id, name, code').order('name')).data || [] : [{ id: 'demo', name: 'Goromonzi Circuit', code: 'GOR-001' }];
  return <main className="root-workspace"><header className="navbar"><Link className="wordmark" href="/"><span className="mark"><i /></span><strong>Wesley<span>Link</span></strong></Link><div className="scope-pill">Platform control centre</div><div className="tools"><button>Root admin</button><b>TM</b></div></header><section className="root-content"><div className="root-heading"><div><em>Platform administration</em><h1>Connection at a glance.</h1><p>Manage the WesleyLink network from one secure control centre.</p></div><Link className="action root-action" href="/setup">＋ Register circuit</Link></div><div className="root-grid"><article className="root-card root-feature"><em>Network structure</em><strong>Build the connection.</strong><p>Conferences, districts and circuits will be managed here as WesleyLink grows.</p><div className="hierarchy"><span>Conference</span><b>→</b><span>District</span><b>→</b><span className="selected-scope">Circuit</span></div></article><article className="root-card"><small>Active circuits</small><b className="root-number">{String(circuits.length).padStart(2, '0')}</b><span className="root-muted">Registered circuits</span></article><article className="root-card"><small>Platform users</small><b className="root-number">01</b><span className="root-muted">Root administrators</span></article></div><div className="root-table"><div className="panel-head"><h2>Registered circuits</h2><button className="panel-link">View all</button></div>{circuits.map(circuit => <div className="root-table-row" key={circuit.id}><span className="row-mark green"/><div><strong>{circuit.name}</strong><small>{circuit.code || 'No circuit code'} · Registered circuit</small></div><b>Active</b><Link href="/">Open workspace →</Link></div>)}</div></section></main>;
}
