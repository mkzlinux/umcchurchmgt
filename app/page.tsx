'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

type View = 'overview' | 'people' | 'calendar' | 'committees' | 'finance' | 'reports' | 'admin';

const nav: Array<[View, string]> = [
  ['overview', 'Overview'], ['people', 'People'], ['calendar', 'Calendar'], ['committees', 'Committees'],
  ['finance', 'Finance'], ['reports', 'Reports'], ['admin', 'More'],
];

const pageData: Record<Exclude<View, 'overview'>, { eyebrow: string; title: string; description: string; stats: Array<[string, string, string]>; rows: Array<[string, string, string]> }> = {
  people: { eyebrow: 'People', title: 'People & membership', description: 'Keep every member, section and movement in one trusted register.', stats: [['Total members', '320', '↑ 6.7% this year'], ['Full members', '218', '68.1% of membership'], ['Sections', '12', '3 preaching points'], ['Needs review', '08', 'Records need attention']], rows: [['New member register', 'Goromonzi Central', '12'], ['Transfer received', 'Acturus Section', '04'], ['Category review', 'Children under 12', '08']] },
  calendar: { eyebrow: 'Planning', title: 'The church calendar', description: 'Approved ministry plans, council decisions and circuit events.', stats: [['This month', '14', '6 approved events'], ['Awaiting approval', '03', 'Council review queue'], ['Churches active', '06', 'Across the circuit'], ['Next event', '14 Jun', 'Church Council']], rows: [['Church Council meeting', 'Goromonzi UMC · 10:00 AM', '14 Jun'], ['Harvest Sunday', 'All local churches', '21 Jun'], ['Section leaders gathering', 'Goromonzi UMC', '28 Jun']] },
  committees: { eyebrow: 'Ministry plans', title: 'Ministry plans in motion', description: 'Turn committee objectives into approved action and measurable outcomes.', stats: [['Active committees', '09', 'Across 6 churches'], ['In review', '03', 'Awaiting council'], ['Approved this year', '21', '↑ 12% vs last year'], ['Completed', '16', '76% completion rate']], rows: [['Women’s ministry retreat', 'RRW Committee', 'Review'], ['Youth revival weekend', 'UMYF Committee', 'Review'], ['Community outreach drive', 'Evangelism', 'Review']] },
  finance: { eyebrow: 'Stewardship', title: 'Stewardship overview', description: 'Track USD and ZWL separately with a clear, accountable financial picture.', stats: [['Income · USD', '$18,420', 'This reporting period'], ['Expenses · USD', '$11,860', '64% of budget'], ['Income · ZWL', '2.84m', 'Recorded separately'], ['Awaiting approval', '02', 'Payments to review']], rows: [['Harvest Sunday collection', 'USD · Income', '$2,410'], ['Youth ministry supplies', 'USD · Expense', '$380'], ['Nherera Sunday', 'ZWL · Income', 'Z$420k']] },
  reports: { eyebrow: 'Reporting', title: 'Statistics & reporting', description: 'Build accurate year-bound reports from the records your church already keeps.', stats: [['ZEAC readiness', '87%', '4 items need attention'], ['Report period', '2025/26', '1 Jul 2025 – 30 Jun 2026'], ['Opening members', '300', 'Carried from prior period'], ['Closing members', '320', 'Net change +20']], rows: [['ZEAC statistical report', 'Circuit · 2025/26', '87%'], ['Detailed statistics report', 'Circuit · 2025/26', 'Draft'], ['Membership movement', 'Current year', 'Ready']] },
  admin: { eyebrow: 'Administration', title: 'Manage the circuit', description: 'Configure people, churches, sections, roles and pastoral appointments.', stats: [['Local churches', '06', 'Active in this circuit'], ['Preaching points', '03', 'Connected locations'], ['Sections', '12', 'Geographic areas'], ['Users & roles', '28', 'Permissions managed']], rows: [['Goromonzi UMC', 'Local church', 'Active'], ['Acturus', 'Preaching point', 'Active'], ['Goromonzi Central', 'Section', 'Active']] },
};

function Mark() { return <span className="mark" aria-hidden="true"><i /></span>; }
function Stat({ stat }: { stat: [string, string, string] }) { return <article className="stat"><span>{stat[0]}</span><b>{stat[1]}</b><small>{stat[2]}</small></article>; }

const calendarEvents: Record<number, { title: string; kind: string }[]> = {
  4: [{ title: 'Church Council', kind: 'green' }],
  11: [{ title: 'RRW retreat', kind: 'red' }],
  14: [{ title: 'Council meeting', kind: 'blue' }],
  21: [{ title: 'Harvest Sunday', kind: 'gold' }],
  28: [{ title: 'Section leaders', kind: 'green' }],
};
function CalendarWorkspace() {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const leading = Array.from({ length: 1 });
  return <div className="calendar-page"><div className="calendar-heading"><div><em>Planning</em><h1>The church calendar</h1><p>Approved ministry plans, council decisions and circuit events.</p></div><div className="calendar-actions"><button className="action secondary" onClick={() => window.print()}>Print calendar ↗</button><button className="action" onClick={() => alert('New event form will connect to Supabase.')}>＋ New event</button></div></div><div className="calendar-toolbar"><button>‹</button><strong>June 2026</strong><button>›</button><span /><button className="selected">Month</button><button>Agenda</button></div><div className="print-header"><Mark /><div><strong>WesleyLink</strong><small>United Methodist Church · Goromonzi Circuit</small></div><b>JUNE 2026</b></div><div className="month-grid"><div className="weekdays">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => <b key={day}>{day}</b>)}</div><div className="days">{leading.map((_, i) => <div className="day blank" key={`blank-${i}`} />)}{days.map(day => <div className={`day ${day === 14 ? 'today' : ''}`} key={day}><strong>{day}</strong>{calendarEvents[day]?.map(event => <span className={`calendar-event ${event.kind}`} key={event.title}>{event.title}</span>)}</div>)}</div></div></div>;
}

export default function Home() {
  const [stage, setStage] = useState<'splash' | 'login' | 'menu' | 'app'>('splash');
  const [view, setView] = useState<View>('overview');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [authError, setAuthError] = useState('');
  useEffect(() => { const timer = window.setTimeout(() => setStage('login'), 1450); return () => window.clearTimeout(timer); }, []);
  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '');
    const password = String(form.get('password') || '');
    const supabase = createClient();
    if (!supabase) { setStage('menu'); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setAuthError(error.message); return; }
    setStage('menu');
  };
  const enter = (next: View) => { setView(next); setStage('app'); };

  if (stage === 'splash') return <main className="splash"><div className="orbit" /><div className="splash-mark"><Mark /></div><h1>Wesley<span>Link</span></h1><div className="rule" /><p>Connected for ministry. Equipped for mission.</p></main>;
  if (stage === 'login') return <main className="login"><div className="login-card"><div className="wordmark"><Mark /><strong>Wesley<span>Link</span></strong></div><em>Circuit workspace</em><h1>Welcome back.</h1><p>Sign in to continue to your connected church workspace.</p><form onSubmit={signIn}><label>Email address<input name="email" type="email" defaultValue="thandi@wesleylink.org" required /></label><label>Password<div className="password"><input name="password" type={passwordVisible ? 'text' : 'password'} defaultValue="demo-password" required /><button type="button" onClick={() => setPasswordVisible(!passwordVisible)}>{passwordVisible ? 'Hide' : 'Show'}</button></div></label><div className="login-row"><label><input type="checkbox" defaultChecked /> Remember me</label><a href="#">Forgot password?</a></div>{authError && <div className="auth-error" role="alert">{authError}</div>}<button className="submit">Sign in <span>→</span></button></form><small>Demo workspace · <b>Goromonzi Circuit</b></small></div></main>;
  if (stage === 'menu') return <main className="menu"><header><button className="wordmark menu-logo" onClick={() => setStage('menu')}><Mark /><strong>Wesley<span>Link</span></strong></button><div className="identity">Goromonzi Circuit <b>TM</b> Thandi Moyo⌄</div></header><section className="menu-heading"><div><em>Circuit workspace</em><h1>What would you like to open?</h1><p>Choose a workspace to continue.</p></div><div className="period">2025 / 26 <small>Reporting year</small></div></section><section className="tiles">{[['overview','Your circuit','Overview','See the pulse of your churches, people and ministry.','tile-green'],['people','Community','People & membership','Membership, sections, movements and pastoral records.','tile-blue'],['calendar','Planning','Calendar','Approved events, council plans and ministry dates.','tile-red'],['finance','Stewardship','Finance','Income, expenditure, budgets and giving analytics.','tile-gold'],['reports','Reporting','Statistics & reports','ZEAC readiness, charts and premium A4 reports.','tile-olive'],['admin','Administration','Manage the circuit','Churches, sections, committees, roles and appointments.','tile-slate']].map(t => <button key={t[0]} className={`tile ${t[4]}`} onClick={() => enter(t[0] as View)}><em>{t[1]}</em><strong>{t[2]}</strong><small>{t[3]}</small><i>↗</i></button>)}</section><footer>↑↓ Move &nbsp;&nbsp;&nbsp; <b>ENTER</b> Select workspace <span>WesleyLink · Prototype</span></footer></main>;

  const data = view === 'overview' ? null : pageData[view];
  return <main className="app"><header className="navbar"><button className="wordmark" onClick={() => setStage('menu')}><Mark /><strong>Wesley<span>Link</span></strong></button><nav>{nav.map(([key, label]) => <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>)}</nav><div className="tools"><button>2025/26⌄</button><button>◌</button><b>TM</b></div></header><section className="workspace">{view === 'calendar' ? <CalendarWorkspace /> : view === 'overview' ? <><div className="hero"><div><em>Good morning, Thandi</em><h1>Welcome to your circuit.</h1><p>Here’s what’s happening across Goromonzi Circuit today.</p></div><button className="action" onClick={() => setView('reports')}>Open ZEAC report →</button><div className="hero-visual" aria-hidden="true"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-core"><b>320</b><small>members</small></div><span className="hero-label label-one">+20 this year</span><span className="hero-label label-two">87% ready</span></div></div><div className="stats"><Stat stat={['Total membership','320','↑ 6.7% from last year']} /><Stat stat={['Avg. Sunday attendance','184','↑ 4.2% vs previous period']} /><Stat stat={['Income this period','$18,420','ZWL 2,840,000 recorded']} /><Stat stat={['ZEAC readiness','87%','4 items need attention']} /></div><div className="panels"><Panel title="Membership movement" chart /><Panel title="Awaiting council review" rows={['Women’s ministry retreat','Youth revival weekend','Community outreach drive']} /><Panel title="Upcoming on the calendar" rows={['Church Council meeting','Harvest Sunday','Section leaders’ gathering']} /></div></> : <><div className="hero page-hero"><div><em>{data?.eyebrow}</em><h1>{data?.title}</h1><p>{data?.description}</p></div><button className="action" onClick={() => alert(`New ${data?.eyebrow} form will connect to Supabase.`)}>＋ New {data?.eyebrow}</button></div><div className="stats">{data?.stats.map((s, i) => <Stat key={i} stat={s} />)}</div><div className="panels"><Panel title="Recent activity" rows={data?.rows.map(row => `${row[0]} · ${row[2]}`) || []} /><Panel title="Workspace action" rows={['Live Supabase data will appear here','Role-aware actions are ready','No records require attention']} /></div></>}</section></main>;
}

function Panel({ title, rows = [], chart = false }: { title: string; rows?: string[]; chart?: boolean }) { return <article className="panel"><div className="panel-head"><h2>{title}</h2><button className="panel-link" onClick={() => alert(`${title} workspace will connect to Supabase.`)}>View all</button></div>{chart ? <div className="chart"><svg viewBox="0 0 600 160" preserveAspectRatio="none"><path d="M0 125 C65 96 75 135 140 110 S230 118 285 78 S370 108 430 65 S505 88 600 32" /><path className="secondary" d="M0 143 C65 124 90 142 140 132 S230 132 285 110 S370 130 430 102 S505 118 600 94" /></svg><div className="months">Jul　 Aug　 Sep　 Oct　 Nov　 Dec　 Jan　 Feb</div></div> : <div className="rows">{rows.map((row, i) => <div className="row" key={i}><i /> <span>{row}</span><b>{i === 0 ? 'Review' : 'Open'}</b></div>)}</div>}</article>; }
