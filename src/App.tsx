import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Activity, Archive, Bell, BookCopy, BookOpen, ChartNoAxesCombined, ChevronDown, CircleDollarSign, GraduationCap, LayoutDashboard, LibraryBig, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Settings, ShieldCheck, Sun, Users, X } from 'lucide-react'
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
  { label: 'Notifications', to: '/notifications', icon: Bell }, { label: 'Hiya Shaikh', to: '/student/profile', icon: GraduationCap },
]
const titles: Record<string, string> = { '/dashboard': 'Overview', '/student': 'My overview', '/catalog': 'Book Catalog', '/inventory': 'Inventory', '/circulation': 'Circulation', '/members': 'Members', '/reservations': 'Reservations', '/overdue': 'Overdue & fines', '/reports': 'Reports & analytics', '/notifications': 'Notifications', '/settings': 'Settings', '/student/loans': 'My loans', '/student/reservations': 'My reservations', '/student/profile': 'Hiya Shaikh' }

function LoginPage() {
  const { setRole, theme, toggleTheme, toast } = useLibrary(), navigate = useNavigate()
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [show, setShow] = useState(false), [error, setError] = useState('')
  const enter = (role: 'librarian' | 'student') => { setRole(role); navigate(role === 'student' ? '/student' : '/dashboard', { replace: true }) }
  const handleGoogleLogin = () => {
    toast('Signed in via Google as Hiya Shaikh (hiyashaikh3@gmail.com)', 'success')
    enter('student')
  }

  return <div className="login-page">
    <div className="login-theme-corner">
      <button type="button" className="theme-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
    </div>
    <div className="login-card">
      <div className="brand-lockup login-brand">
        <div className="brand-mark"><LibraryBig size={21} /></div>
        <div><strong>GH Raisoni College of Engineering and Management</strong><span>Central Digital Library System</span></div>
      </div>
      <div className="login-copy">
        <BadgeWelcome />
        <h1>Campus Library Portal</h1>
        <p>Sign in to your library workspace and pick up where curiosity left off.</p>
      </div>

      <button type="button" className="google-login-btn" onClick={handleGoogleLogin}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>Sign in with Google</span>
      </button>

      <div className="login-divider"><span>or continue with email</span></div>

      <form className="login-form" onSubmit={e => { e.preventDefault(); if (!email.trim() || !password) setError('Enter an email and password to continue.'); else { if (email.toLowerCase().includes('librarian') || email.toLowerCase().includes('admin')) { enter('librarian'); } else { enter('student'); } } }}>
        <label className="field"><span className="field-label">Email address</span><input type="email" placeholder="you@raisoni.net" value={email} onChange={e => { setEmail(e.target.value); setError('') }} /></label>
        <label className="field"><span className="field-label">Password</span><span className="password-wrap"><input type={show ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} /><button type="button" className="text-action" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></span></label>
        {error && <p className="login-error">{error}</p>}<Button type="submit" className="login-submit">Sign in <span>→</span></Button>
      </form>
      <div className="login-divider"><span>or sign in directly as</span></div>
      <div className="portal-access"><button onClick={() => enter('librarian')}><span className="portal-icon"><ShieldCheck size={17} /></span><span><strong>Librarian Portal</strong><small>Manage catalog, circulation & members</small></span><span className="portal-arrow">→</span></button>
        <button onClick={() => enter('student')}><span className="portal-icon"><GraduationCap size={17} /></span><span><strong>Student Portal</strong><small>Access account & reservations</small></span><span className="portal-arrow">→</span></button></div>
      <p className="portal-note">Wagholi, Pune · GHRCEMP Digital Portal</p>
      <p className="portal-credit">Built and maintained by Hiya Shaikh (25CO64)</p>
    </div>
  </div>
}
function BadgeWelcome() { return <span className="welcome-eyebrow"><span /> YOUR CAMPUS, CONNECTED</span> }

function AppShell() {
  const { role, setRole, data, theme, toggleTheme } = useLibrary()
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
  if (!role) return <LoginPage />
  const member = data.members.find(m => m.id === '25CO64') || data.members.find(m => m.id === 'member-01') || data.members[0]
  const profileLabel = member?.name || 'Hiya Shaikh'
  const nav = role === 'librarian' ? librarianNav : studentNav.map(item => item.to === '/student/profile' ? { ...item, label: profileLabel } : item)
  const pageTitle = (location.pathname === '/student/profile' ? profileLabel : titles[location.pathname]) || (location.pathname.startsWith('/catalog/') ? 'Book details' : 'Library')
  const unread = data.notifications.filter(n => !n.readAt && (!n.memberId || role === 'librarian' || n.memberId === (member?.id || '25CO64'))).length
  const userInitials = role === 'librarian' ? 'MW' : (member?.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'HS')
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-brand"><div className="brand-mark"><LibraryBig size={21} /></div><div className="brand-text"><strong>GHRCEMP</strong><span>Central Library</span></div><IconButton label="Close navigation" className="mobile-close" onClick={() => setMobileOpen(false)}><X size={18} /></IconButton></div>
      <div className="workspace-label">{role === 'librarian' ? 'LIBRARY WORKSPACE' : 'MEMBER PORTAL'}</div>
      <nav className="side-nav" aria-label="Main navigation">{nav.map(({ label, to, icon: Icon }) => <NavLink onClick={() => setMobileOpen(false)} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} to={to} key={to}><Icon size={18} /><span>{label}</span>{to === '/notifications' && unread > 0 && <em>{unread}</em>}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-symbol">✳</div><div className="brand-text"><strong>Need a hand?</strong><span>We're here to help.</span></div><button title="Open help" onClick={() => window.alert('For assistance, contact ghrcemp@gmail.com.')}>↗</button></div>
        <div className="sidebar-user"><div className="avatar">{userInitials}</div><div className="brand-text"><strong>{role === 'librarian' ? 'Mirkword' : member?.name}</strong><span>{role === 'librarian' ? 'Head Librarian' : 'Student member'}</span></div><IconButton label="Sign out" onClick={() => setRole(null)}><LogOut size={16} /></IconButton></div></div>
    </aside>
    <div className="main-column">
      <header className="topbar"><div className="topbar-left"><IconButton label="Open navigation" className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></IconButton><IconButton label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="collapse-button" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}</IconButton><span className="crumb-root">Workspace</span><span className="crumb-sep">/</span><span className="crumb-current">{pageTitle}</span></div>
        <div className="topbar-right"><form className={`global-search ${mobileSearch ? 'mobile-active' : ''}`} onClick={() => { if (window.innerWidth <= 680) setMobileSearch(true) }} onSubmit={e => { e.preventDefault(); navigate(`/catalog?search=${encodeURIComponent(search)}`); setMobileSearch(false) }}><Search size={16} /><input aria-label="Search the library" placeholder="Search books, authors..." value={search} onChange={e => setSearch(e.target.value)} /><kbd>⌘ K</kbd></form>
          <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</IconButton>
          <IconButton label={`Notifications${unread ? `, ${unread} unread` : ''}`} className="top-notification" onClick={() => navigate('/notifications')}><Bell size={18} />{unread > 0 && <i />}</IconButton><div className="profile-wrap"><button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)}><span className="avatar">{userInitials}</span><ChevronDown size={14} /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-label">SWITCH PORTAL</div><button onClick={() => { setRole(role === 'librarian' ? 'student' : 'librarian'); setProfileOpen(false); navigate(role === 'librarian' ? '/student' : '/dashboard') }}><span className="portal-icon">{role === 'librarian' ? <GraduationCap size={16} /> : <ShieldCheck size={16} />}</span><span><strong>Switch to {role === 'librarian' ? 'student' : 'librarian'}</strong><small>Switch to {role === 'librarian' ? 'student' : 'librarian'} portal</small></span></button><button onClick={() => { toggleTheme(); setProfileOpen(false) }}><span className="portal-icon">{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</span><span><strong>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</strong><small>Switch appearance</small></span></button><button onClick={() => { setRole(null); setProfileOpen(false); navigate('/') }}><LogOut size={16} /> Sign out</button></div>}</div>
        </div></header>
      <main className="content-area"><Routes>
        <Route path="/" element={<Navigate to={role === 'student' ? '/student' : '/dashboard'} replace />} />
        <Route path="/dashboard" element={role === 'librarian' ? <DashboardPage /> : <Navigate to="/student" replace />} />
        <Route path="/student" element={role === 'student' ? <StudentDashboardPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/catalog" element={<CatalogPage />} /><Route path="/catalog/:bookId" element={<BookDetailsPage />} />
        <Route path="/inventory" element={role === 'librarian' ? <InventoryPage /> : <Navigate to="/catalog" replace />} />
        <Route path="/circulation" element={role === 'librarian' ? <CirculationPage /> : <Navigate to="/student/loans" replace />} />
        <Route path="/members" element={role === 'librarian' ? <MembersPage /> : <Navigate to="/student/profile" replace />} />
        <Route path="/reservations" element={role === 'librarian' ? <ReservationsPage /> : <Navigate to="/student/reservations" replace />} />
        <Route path="/overdue" element={role === 'librarian' ? <OverduePage /> : <Navigate to="/student" replace />} />
        <Route path="/reports" element={role === 'librarian' ? <ReportsPage /> : <Navigate to="/student" replace />} />
        <Route path="/notifications" element={<NotificationsPage />} /><Route path="/settings" element={role === 'librarian' ? <SettingsPage /> : <Navigate to="/student" replace />} />
        <Route path="/student/loans" element={role === 'student' ? <StudentLoansPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/student/reservations" element={role === 'student' ? <StudentReservationsPage /> : <Navigate to="/reservations" replace />} />
        <Route path="/student/profile" element={role === 'student' ? <StudentProfilePage /> : <Navigate to="/members" replace />} />
        <Route path="*" element={<Navigate to={role === 'student' ? '/student' : '/dashboard'} replace />} />
      </Routes></main>
      <footer className="app-footer"><span>GH Raisoni College of Engineering and Management · Central Library</span><span>Autonomous Institute · Pune</span></footer>
    </div><Toasts />
  </div>
}
export default function App() { return <AppShell /> }
