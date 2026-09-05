import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import '../../globals.css';

type Props = { params: Promise<{ id: string }> };
export default async function CircuitPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) return <DemoCircuit id={id} />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');
  const { data: circuit } = await supabase.from('circuits').select('id,name,code').eq('id', id).maybeSingle();
  if (!circuit) notFound();
  const { count: churches } = await supabase.from('churches').select('*', { count: 'exact', head: true }).eq('circuit_id', id);
  const { count: members } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('circuit_id', id).eq('status', 'active');
  const { count: events } = await supabase.from('calendar_events').select('*', { count: 'exact', head: true }).eq('circuit_id', id);
  return <CircuitView circuit={circuit} stats={[['Local churches', String(churches || 0)], ['Active members', String(members || 0)], ['Calendar events', String(events || 0)]]} />;
}
function DemoCircuit({ id }: { id: string }) { return <CircuitView circuit={{ id, name: 'Goromonzi Circuit', code: 'GOR-001' }} stats={ [['Local churches','06'],['Active members','320'],['Calendar events','14']] } />; }
function CircuitView({ circuit, stats }: { circuit: { id: string; name: string; code?: string | null }; stats: string[][] }) { return <main className="root-workspace"><header className="navbar"><Link className="wordmark" href="/root"><span className="mark"><i /></span><strong>Wesley<span>Link</span></strong></Link><div className="scope-pill">{circuit.name}</div><div className="tools"><Link href="/root" className="back-root">Root centre</Link><b>TM</b></div></header><section className="root-content"><div className="root-heading"><div><em>Circuit workspace · {circuit.code || 'No code'}</em><h1>{circuit.name}</h1><p>Manage churches, people, ministry and reporting in this circuit.</p></div><Link className="action root-action" href={`/circuit/${circuit.id}/churches`}>＋ Configure church</Link></div><div className="root-grid">{stats.map(([label,value]) => <article className="root-card" key={label}><small>{label}</small><b className="root-number">{value}</b><span className="root-muted">Live workspace metric</span></article>)}</div><div className="root-table"><div className="panel-head"><h2>Next steps</h2></div><div className="root-table-row"><span className="row-mark green"/><div><strong>Complete circuit structure</strong><small>Add churches, preaching points and sections</small></div><Link href="/setup">Continue setup →</Link></div><div className="root-table-row"><span className="row-mark blue"/><div><strong>Open membership register</strong><small>Record members and reporting-year events</small></div><Link href={`/circuit/${circuit.id}/members`}>Open membership →</Link></div></div></section></main>; }
