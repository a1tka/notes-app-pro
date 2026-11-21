import { useEffect, useState } from 'react';
import { api } from './api.js';

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      onAuth(await api(`/auth/${mode}`, { method: 'POST', body: f }));
    } catch (x) { setErr(x.message); }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>📝 Notes App Pro</h1>
      <p className="muted">Your private, encrypted notes.</p>
      {mode === 'register' && <input placeholder="Name" value={f.name} onChange={set('name')} required />}
      <input type="email" placeholder="Email" value={f.email} onChange={set('email')} required />
      <input type="password" placeholder="Password (8+ chars)" value={f.password} onChange={set('password')} required minLength={8} />
      {err && <div className="error">{err}</div>}
      <button>{mode === 'login' ? 'Log in' : 'Create account'}</button>
      <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
      </a>
    </form>
  );
}

function Notes({ session, onLogout }) {
  const { token, user } = session;
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editing, setEditing] = useState(null);
  const [err, setErr] = useState('');

  const call = async (path, opts) => {
    try { return await api(path, { ...opts, token }); }
    catch (x) { if (x.status === 401) onLogout(); else setErr(x.message); throw x; }
  };

  useEffect(() => { call('/notes').then(setNotes).catch(() => {}); }, []);

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      if (editing) {
        const n = await call(`/notes/${editing}`, { method: 'PUT', body: form });
        setNotes(notes.map((x) => (x._id === editing ? n : x)));
      } else {
        const n = await call('/notes', { method: 'POST', body: form });
        setNotes([n, ...notes]);
      }
      setForm({ title: '', content: '' });
      setEditing(null);
    } catch {}
  };

  const remove = async (id) => {
    if (!confirm('Delete this note?')) return;
    try { await call(`/notes/${id}`, { method: 'DELETE' }); setNotes(notes.filter((n) => n._id !== id)); } catch {}
  };

  return (
    <div className="wrap">
      <header>
        <h1>📝 Notes</h1>
        <div><span className="muted">{user.name}</span> <button className="ghost" onClick={onLogout}>Log out</button></div>
      </header>
      <form className="card" onSubmit={save}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={120} />
        <textarea placeholder="Write something…" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        {err && <div className="error">{err}</div>}
        <div className="row">
          <button>{editing ? 'Update note' : 'Add note'}</button>
          {editing && <button type="button" className="ghost" onClick={() => { setEditing(null); setForm({ title: '', content: '' }); }}>Cancel</button>}
        </div>
      </form>
      <div className="grid">
        {notes.map((n) => (
          <div className="card note" key={n._id}>
            <h3>{n.title}</h3>
            <p>{n.content}</p>
            <small className="muted">{new Date(n.updatedAt).toLocaleString()}</small>
            <div className="row">
              <button className="ghost" onClick={() => { setEditing(n._id); setForm({ title: n.title, content: n.content }); window.scrollTo(0, 0); }}>Edit</button>
              <button className="ghost danger" onClick={() => remove(n._id)}>Delete</button>
            </div>
          </div>
        ))}
        {!notes.length && <p className="muted">No notes yet.</p>}
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('session')); } catch { return null; }
  });
  const onAuth = (s) => { localStorage.setItem('session', JSON.stringify(s)); setSession(s); };
  const logout = () => { localStorage.removeItem('session'); setSession(null); };
  return session ? <Notes session={session} onLogout={logout} /> : <Auth onAuth={onAuth} />;
}
