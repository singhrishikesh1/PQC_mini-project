import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Archive, Bell, BookCopy, BookOpen, ChartNoAxesCombined, ChevronDown, CircleDollarSign, GraduationCap, LayoutDashboard, LibraryBig, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search, Settings, ShieldCheck, Users, X } from 'lucide-react'
import { Button, IconButton, Toasts } from './components'
import { useLibrary } from './store'
import { DashboardPage, StudentDashboardPage, CatalogPage, BookDetailsPage, InventoryPage, CirculationPage, MembersPage, ReservationsPage, OverduePage, ReportsPage, NotificationsPage, SettingsPage, StudentLoansPage, StudentReservationsPage, StudentProfilePage } from './pages'

const librarianNav = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard }, { label: 'Book Catalog', to: '/catalog', icon: BookOpen },
  { label: 'Inventory', to: '/inventory', icon: Archive }, { label: 'Circulation', to: '/circulation', icon: BookCopy },
  { label: 'Members', to: '/members', icon: Users }, { label: 'Reservations', to: '/reservations', icon: Activity },
  { label: 'Overdue & fines', to: '/overdue', icon: CircleDollarSign }, { label: 'Reports & analytics', to: '/reports', icon: ChartNoAxesCombined },
  { label: 'Notifications', to: '/notifications', icon: Bell }, { label: 'Settings', to: '/settings', icon: Settings },
]
const studentNav = [
  { label: 'My overview', to: '/student', icon: LayoutDashboard }, { label: 'Book Catalog', to: '/catalog', icon: BookOpen },
  { label: 'My loans', to: '/student/loans', icon: BookCopy }, { label: 'Reservations', to: '/student/reservations', icon: Activity },
  { label: 'Notifications', to: '/notifications', icon: Bell }, { label: 'My profile', to: '/student/profile', icon: GraduationCap },
]
const titles: Record<string, string> = { '/dashboard': 'Overview', '/student': 'My overview', '/catalog': 'Book Catalog', '/inventory': 'Inventory', '/circulation': 'Circulation', '/members': 'Members', '/reservations': 'Reservations', '/overdue': 'Overdue & fines', '/reports': 'Reports & analytics', '/notifications': 'Notifications', '/settings': 'Settings', '/student/loans': 'My loans', '/student/reservations': 'My reservations', '/student/profile': 'My profile' }

function LoginPage() {
  const { setRole, toast } = useLibrary(), navigate = useNavigate()
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [show, setShow] = useState(false), [error, setError] = useState('')
  const enter = (role: 'librarian' | 'student') => { setRole(role); navigate(role === 'student' ? '/student' : '/dashboard', { replace: true }) }
  return <div className="login-page"><div className="login-panel"><div className="brand-lockup login-brand"><div className="brand-mark"><LibraryBig size={21}/></div><div><strong>Northstar</strong><span>Library</span></div></div>
    <div className="login-copy"><BadgeWelcome/><h1>A little more room<br/>for great ideas.</h1><p>Sign in to your library workspace and pick up where curiosity left off.</p></div>
    <form className="login-form" onSubmit={e => { e.preventDefault(); if (!email.trim() || !password) setError('Enter an email and password to continue.'); else { setError('Demo sign-in accepts any email and password. Choose a demo role below.'); toast('Choose a demo account to open the workspace.', 'info') } }}>
      <label className="field"><span className="field-label">Email address</span><input type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError('') }}/></label>
      <label className="field"><span className="field-label">Password</span><span className="password-wrap"><input type={show ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}/><button type="button" className="text-action" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></span></label>
      {error && <p className="login-error">{error}</p>}<Button type="submit" className="login-submit">Sign in <span>→</span></Button>
    </form>
    <div className="login-divider"><span>or explore the demo</span></div>
    <div className="demo-access"><button onClick={() => enter('librarian')}><span className="demo-icon"><ShieldCheck size={17}/></span><span><strong>Continue as librarian</strong><small>Manage the library workspace</small></span><span className="demo-arrow">→</span></button>
      <button onClick={() => enter('student')}><span className="demo-icon"><GraduationCap size={17}/></span><span><strong>Continue as student</strong><small>Explore your member account</small></span><span className="demo-arrow">→</span></button></div>
    <p className="demo-note">Demonstration only · No real account or password required</p>
  </div><div className="login-art"><div className="art-orb orb-a"/><div className="art-orb orb-b"/><div className="art-grid"/><div className="art-quote"><div className="quote-mark">“</div><p>A library is not a luxury but one of the necessities of life.</p><span>— Henry Ward Beecher</span></div><div className="art-foot"><span>Northstar Library</span><span>Learn · Discover · Grow</span></div></div></div>
}
function BadgeWelcome() { return <span className="welcome-eyebrow"><span/> YOUR CAMPUS, CONNECTED</span> }

function AppShell() {
  const { role, setRole, data } = useLibrary()
  const [collapsed, setCollapsed] = useState(false), [mobileOpen, setMobileOpen] = useState(false), [profileOpen, setProfileOpen] = useState(false), [search, setSearch] = useState(''), [mobileSearch, setMobileSearch] = useState(false)
  const location = useLocation(), navigate = useNavigate()
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.querySelector<HTMLInputElement>('.global-search input')?.focus(); setMobileSearch(true) }
      if (event.key === 'Escape') { setProfileOpen(false); setMobileSearch(false) }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])
  if (!role) return <LoginPage/>
  const nav = role === 'librarian' ? librarianNav : studentNav
  const pageTitle = titles[location.pathname] || (location.pathname.startsWith('/catalog/') ? 'Book details' : 'Library')
  const unread = data.notifications.filter(n => !n.readAt && (!n.memberId || role === 'librarian' || n.memberId === 'member-01')).length
  const member = data.members.find(m => m.id === 'member-01')
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/>}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><LibraryBig size={21}/></div><div className="brand-text"><strong>Northstar</strong><span>Library</span></div><IconButton label="Close navigation" className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18}/></IconButton></div>
      <div className="workspace-label">{role === 'librarian' ? 'LIBRARY WORKSPACE' : 'MEMBER PORTAL'}</div>
      <nav className="side-nav" aria-label="Main navigation">{nav.map(({ label, to, icon: Icon }) => <NavLink onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} to={to} key={to}><Icon size={18}/><span>{label}</span>{to === '/notifications' && unread > 0 && <em>{unread}</em>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-symbol">✳</div><div className="brand-text"><strong>Need a hand?</strong><span>We're here to help.</span></div><button title="Open help" onClick={() => window.alert('For demo assistance, contact hello@northstarlibrary.example.com.')}>↗</button></div>
        <div className="sidebar-user"><div className="avatar">{role === 'librarian' ? 'AM' : 'AM'}</div><div className="brand-text"><strong>{role === 'librarian' ? 'Avery Morgan' : member?.name}</strong><span>{role === 'librarian' ? 'Library administrator' : 'Student member'}</span></div><IconButton label="Sign out" onClick={() => setRole(null)}><LogOut size={16}/></IconButton></div></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div className="topbar-left"><IconButton label="Open navigation" className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20}/></IconButton><IconButton label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="collapse-button" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}</IconButton><span className="crumb-root">Workspace</span><span className="crumb-sep">/</span><span className="crumb-current">{pageTitle}</span></div>
        <div className="topbar-right"><form className={`global-search ${mobileSearch ? 'mobile-active' : ''}`} onClick={() => { if (window.innerWidth <= 680) setMobileSearch(true) }} onSubmit={e => { e.preventDefault(); navigate(`/catalog?search=${encodeURIComponent(search)}`); setMobileSearch(false) }}><Search size={16}/><input aria-label="Search the library" placeholder="Search books, authors..." value={search} onChange={e => setSearch(e.target.value)}/><kbd>⌘ K</kbd></form>
          <IconButton label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="top-notification" onClick={() => navigate('/notifications')}><Bell size={18}/>{unread > 0 && <i/>}</IconButton><div className="profile-wrap"><button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar">AM</span><ChevronDown size={14}/></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-label">DEMO EXPERIENCE</div><button onClick={() => { setRole(role === 'librarian' ? 'student' : 'librarian'); setProfileOpen(false); navigate(role === 'librarian' ? '/student' : '/dashboard') }}><span className="demo-icon">{role === 'librarian' ? <GraduationCap size={16}/> : <ShieldCheck size={16}/>}</span><span><strong>Switch to {role === 'librarian' ? 'student' : 'librarian'}</strong><small>Try the other demo view</small></span></button><button onClick={() => { setRole(null); setProfileOpen(false); navigate('/') }}><LogOut size={16}/> Sign out</button></div>}</div>
        </div></header>
      <main className="content-area"><Routes>
        <Route path="/" element={<Navigate to={role === 'student' ? '/student' : '/dashboard'} replace/>}/>
        <Route path="/dashboard" element={role === 'librarian' ? <DashboardPage/> : <Navigate to="/student" replace/>}/>
        <Route path="/student" element={role === 'student' ? <StudentDashboardPage/> : <Navigate to="/dashboard" replace/>}/>
        <Route path="/catalog" element={<CatalogPage/>}/><Route path="/catalog/:bookId" element={<BookDetailsPage/>}/>
        <Route path="/inventory" element={role === 'librarian' ? <InventoryPage/> : <Navigate to="/catalog" replace/>}/>
        <Route path="/circulation" element={role === 'librarian' ? <CirculationPage/> : <Navigate to="/student/loans" replace/>}/>
        <Route path="/members" element={role === 'librarian' ? <MembersPage/> : <Navigate to="/student/profile" replace/>}/>
        <Route path="/reservations" element={role === 'librarian' ? <ReservationsPage/> : <Navigate to="/student/reservations" replace/>}/>
        <Route path="/overdue" element={role === 'librarian' ? <OverduePage/> : <Navigate to="/student" replace/>}/>
        <Route path="/reports" element={role === 'librarian' ? <ReportsPage/> : <Navigate to="/student" replace/>}/>
        <Route path="/notifications" element={<NotificationsPage/>}/><Route path="/settings" element={role === 'librarian' ? <SettingsPage/> : <Navigate to="/student" replace/>}/>
        <Route path="/student/loans" element={role === 'student' ? <StudentLoansPage/> : <Navigate to="/dashboard" replace/>}/>
        <Route path="/student/reservations" element={role === 'student' ? <StudentReservationsPage/> : <Navigate to="/reservations" replace/>}/>
        <Route path="/student/profile" element={role === 'student' ? <StudentProfilePage/> : <Navigate to="/members" replace/>}/>
        <Route path="*" element={<Navigate to={role === 'student' ? '/student' : '/dashboard'} replace/>}/>
      </Routes></main>
      <footer className="app-footer"><span>Northstar Library · Demo workspace</span><span>Made for curious minds</span></footer>
    </div><Toasts/>
  </div>
}
export default function App() { return <AppShell/> }
