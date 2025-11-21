import { useEffect, useMemo, useState } from 'react'
import { LogIn, UserPlus, MessageSquare, Send, Search, LogOut, Shield, Loader2, UserCircle2 } from 'lucide-react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [me, setMe] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setMe)
      .catch(() => setMe(null))
  }, [token])

  const login = async (username, password) => {
    const res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
    if (!res.ok) throw new Error((await res.json()).detail || 'Login failed')
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('role', data.role)
    setToken(data.access_token)
    return data
  }

  const signup = async (name, username, phone, password) => {
    const res = await fetch(`${API}/auth/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, username, phone, password }) })
    if (!res.ok) throw new Error((await res.json()).detail || 'Signup failed')
    const data = await res.json()
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('role', data.role)
    setToken(data.access_token)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('role'); setToken(''); setMe(null)
  }

  return { token, me, setMe, login, signup, logout, role: localStorage.getItem('role') }
}

function AuthScreen({ onLoggedIn }) {
  const auth = useAuth()
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      let res
      if (mode === 'signup') {
        res = await auth.signup(name, username, phone, password)
      } else {
        res = await auth.login(username, password)
      }
      onLoggedIn(res)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.3),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(147,197,253,0.2),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.25),transparent_40%)]" />
      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center text-white font-bold text-xl shadow-lg">S</div>
            <div>
              <h1 className="text-white text-3xl font-bold leading-tight">Slash Messenger</h1>
              <p className="text-blue-200/80">Modern, fast and stylish messaging</p>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('login')} className={`flex-1 px-4 py-2 rounded-xl transition ${mode==='login' ? 'bg-blue-600 text-white' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}><LogIn className="inline mr-2" size={16}/>Login</button>
            <button onClick={() => setMode('signup')} className={`flex-1 px-4 py-2 rounded-xl transition ${mode==='signup' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}><UserPlus className="inline mr-2" size={16}/>Sign up</button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode==='signup' && (
              <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full bg-white/10 text-white placeholder-blue-200/70 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-400"/>
            )}
            <input required value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="w-full bg-white/10 text-white placeholder-blue-200/70 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-400"/>
            {mode==='signup' && (
              <input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone number" className="w-full bg-white/10 text-white placeholder-blue-200/70 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-400"/>
            )}
            <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/10 text-white placeholder-blue-200/70 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-blue-400"/>
            {error && <div className="text-red-300 text-sm">{error}</div>}
            <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18}/> : <LogIn size={18}/>} {mode==='signup' ? 'Create account' : 'Login'}
            </button>
            <p className="text-blue-200/70 text-xs text-center">Admin access: username online911, password onlinE@911</p>
          </form>
        </div>
        <div className="hidden md:block bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-white/10 rounded-3xl p-8 text-blue-100">
          <h3 className="text-2xl font-semibold mb-4">What you get</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3"><MessageSquare size={18}/> Real-time style DM experience</li>
            <li className="flex items-start gap-3"><Shield size={18}/> Blocking and privacy controls</li>
            <li className="flex items-start gap-3"><UserCircle2 size={18}/> Admin panel to manage users</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ChatUI({ token, me, onLogout }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [current, setCurrent] = useState(null)
  const [thread, setThread] = useState({ messages: [], other: null, you_blocked: false, they_blocked: false })
  const [text, setText] = useState('')

  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])

  const search = async () => {
    if (!query.trim()) return
    const r = await fetch(`${API}/users/search?q=${encodeURIComponent(query)}`, { headers })
    const data = await r.json(); setResults(data)
  }

  const openChat = async (u) => {
    setCurrent(u)
    const r = await fetch(`${API}/messages/thread?with_user=${encodeURIComponent(u.username)}`, { headers })
    const data = await r.json(); setThread(data)
  }

  const send = async () => {
    if (!current || !text.trim()) return
    const r = await fetch(`${API}/messages/send`, { method: 'POST', headers, body: JSON.stringify({ recipient: current.username, msg_type: 'text', text }) })
    if (r.ok) {
      setText(''); openChat(current)
    }
  }

  const blockToggle = async () => {
    if (!current) return
    if (thread.you_blocked) {
      await fetch(`${API}/block?target=${encodeURIComponent(current.username)}`, { method: 'DELETE', headers })
    } else {
      await fetch(`${API}/block?target=${encodeURIComponent(current.username)}`, { method: 'POST', headers })
    }
    openChat(current)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[320px,1fr] bg-slate-950 text-blue-50">
      <aside className="border-r border-white/10 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <img src={me?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + me?.name} className="w-12 h-12 rounded-xl object-cover"/>
          <div>
            <div className="font-semibold">{me?.name}</div>
            <div className="text-xs text-blue-200/70">@{me?.username}</div>
          </div>
          <button onClick={onLogout} className="ml-auto bg-white/10 hover:bg-white/20 rounded-lg p-2"><LogOut size={16}/></button>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&search()} placeholder="Search users by name, username or phone" className="flex-1 bg-white/10 rounded-xl px-3 py-2 outline-none placeholder-blue-200/60"/>
          <button onClick={search} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500"><Search size={18}/></button>
        </div>
        <div className="space-y-2">
          {results.map(u => (
            <button key={u._id} onClick={()=>openChat(u)} className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-2">
              <img src={u.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.name} className="w-10 h-10 rounded-lg object-cover"/>
              <div className="text-left">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-blue-200/70">@{u.username}</div>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <main className="p-4">
        {!current ? (
          <div className="h-full grid place-items-center text-blue-200/70">Search and open a conversation</div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3 mb-3">
              <img src={thread.they_blocked ? 'https://api.dicebear.com/7.x/shapes/svg?seed=x' : (thread.other?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + thread.other?.name)} className="w-10 h-10 rounded-lg object-cover"/>
              <div className="mr-auto">
                <div className="font-semibold">{thread.other?.name}</div>
                <div className="text-xs text-blue-200/70 cursor-pointer" title="View profile">@{thread.other?.username}</div>
              </div>
              <button onClick={blockToggle} className={`px-3 py-1 rounded-lg ${thread.you_blocked ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-white/10 hover:bg-white/20'}`}>{thread.you_blocked ? 'Unblock' : 'Block'}</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {thread.messages.map((m,i) => (
                <div key={i} className={`max-w-[70%] rounded-2xl px-3 py-2 ${m.sender===me.username ? 'ml-auto bg-blue-600' : 'bg-white/10'} `}>
                  {m.text && <div>{m.text}</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={thread.they_blocked? 'You are blocked' : 'Type a message'} disabled={thread.they_blocked || thread.you_blocked} className="flex-1 bg-white/10 rounded-2xl px-4 py-3 outline-none"/>
              <button onClick={send} disabled={thread.they_blocked || thread.you_blocked} className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"><Send size={18}/></button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function AdminPanel({ token }) {
  const headers = useMemo(() => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }), [token])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const r = await fetch(`${API}/admin/users`, { headers })
      if (!r.ok) throw new Error((await r.json()).detail || 'Failed')
      setUsers(await r.json())
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const suspend = async (u, active) => {
    await fetch(`${API}/admin/${active ? 'suspend' : 'activate'}`, { method: 'POST', headers, body: JSON.stringify({ username: u.username }) })
    load()
  }
  const backup = () => { window.open(`${API}/admin/backup.pdf`, '_blank') }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <Shield/> <h2 className="text-xl font-semibold">Admin panel</h2>
        <button onClick={backup} className="ml-auto px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20">Backup PDF</button>
      </div>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <div className="grid gap-2">
        {users.map(u => (
          <div key={u._id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            <img src={u.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=' + u.name} className="w-10 h-10 rounded-lg"/>
            <div>
              <div className="font-medium">{u.name} {u.role==='admin' && <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded ml-1">admin</span>}</div>
              <div className="text-xs text-blue-200/70">@{u.username} • {u.phone}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={()=>suspend(u, u.is_active)} className={`px-3 py-1 rounded-lg ${u.is_active ? 'bg-red-600/80 hover:bg-red-500' : 'bg-green-600/80 hover:bg-green-500'}`}>{u.is_active ? 'Suspend' : 'Activate'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [me, setMe] = useState(null)
  const role = localStorage.getItem('role')

  useEffect(() => {
    if (!token) return
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setMe)
      .catch(() => setMe(null))
  }, [token])

  const handleLogout = () => { localStorage.clear(); setToken(''); setMe(null) }

  if (!token) return <AuthScreen onLoggedIn={(d)=>{ setToken(d.access_token) }} />
  if (!me) return <div className="min-h-screen grid place-items-center bg-slate-950 text-blue-100">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-950 text-blue-50">
      <header className="flex items-center gap-3 p-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center text-white font-bold">S</div>
        <div className="font-semibold">Slash Messenger</div>
        <div className="ml-auto flex items-center gap-2">
          {role==='admin' && <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded">Admin</span>}
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg flex items-center gap-2"><LogOut size={16}/> Logout</button>
        </div>
      </header>
      {role==='admin' ? (
        <AdminPanel token={token} />
      ) : (
        <ChatUI token={token} me={me} onLogout={handleLogout} />
      )}
    </div>
  )
}
