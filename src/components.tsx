import { useEffect, type FormEvent, type ReactNode } from 'react'
import { X, Search, ChevronDown, BookOpen } from 'lucide-react'
import { useLibrary } from './store'
import type { Book } from './types'

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; size?: 'sm' | 'md' }) {
  return <button className={`btn btn-${variant} btn-${size} inline-flex items-center gap-2 ${className}`} {...props}>{children}</button>
}
export function IconButton({ label, children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button aria-label={label} title={label} className={`icon-btn ${className}`} {...props}>{children}</button>
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
export function PageHeading({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{actions && <div className="heading-actions">{actions}</div>}</div>
}
export function SearchInput({ value, onChange, placeholder = 'Search', className = '' }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return <label className={`search-input ${className}`}><Search size={16} aria-hidden="true"/><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>{value && <button type="button" aria-label="Clear search" onClick={() => onChange('')}><X size={14}/></button>}</label>
}
export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return <label className={`field ${className}`}><span className="field-label">{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
export function Modal({ title, subtitle, onClose, children, size = 'md', footer }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; size?: 'sm' | 'md' | 'lg'; footer?: ReactNode }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
    <header className="modal-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><IconButton label="Close dialog" onClick={onClose}><X size={18}/></IconButton></header>
    <div className="modal-body">{children}</div>{footer && <footer className="modal-footer">{footer}</footer>}
  </section></div>
}
export function BookCover({ book, compact = false }: { book: Book; compact?: boolean }) {
  const palettes: Record<string, string> = { 'cat-cs': 'cover-slate', 'cat-prog': 'cover-blue', 'cat-ai': 'cover-lavender', 'cat-science': 'cover-mint', 'cat-math': 'cover-sand', 'cat-fiction': 'cover-rose', 'cat-lit': 'cover-amber', 'cat-business': 'cover-ink', 'cat-finance': 'cover-teal', 'cat-history': 'cover-clay' }
  return <div className={`book-cover ${palettes[book.categoryId] || 'cover-blue'} ${compact ? 'book-cover-compact' : ''}`} aria-label={`Cover of ${book.title}`}>
    {book.coverUrl && <img className="cover-image" src={book.coverUrl} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }}/>}
    <div className="cover-mark"><BookOpen size={compact ? 13 : 17}/></div><span className="cover-title">{book.title}</span><span className="cover-author">{book.author}</span>
  </div>
}
export function Toasts() {
  const { toasts, dismissToast } = useLibrary()
  return <div className="toast-stack" aria-live="polite">{toasts.map(t => <div className={`toast toast-${t.tone}`} key={t.id}><span className="toast-dot"/>{t.message}<button aria-label="Dismiss notification" onClick={() => dismissToast(t.id)}><X size={15}/></button></div>)}</div>
}
export function TableShell({ children, minWidth = '760px' }: { children: ReactNode; minWidth?: string }) {
  return <div className="table-scroll"><table style={{ minWidth }}>{children}</table></div>
}
export function SelectField({ label, value, onChange, options, className = '' }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return <label className={`select-field ${className}`}><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}</select><ChevronDown size={14} aria-hidden="true"/></label>
}
export function FormError({ message }: { message: string }) { return message ? <div className="form-error" role="alert">{message}</div> : null }
export function submitWith(setError: (value: string) => void, fn: () => void) { return (e: FormEvent) => { e.preventDefault(); try { setError(''); fn() } catch (error) { setError(error instanceof Error ? error.message : 'Something went wrong.') } } }
