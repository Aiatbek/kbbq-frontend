import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../context/ToastContext'
import api from '../lib/axios'

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchMenu  = ()             => api.get('/api/menu').then(r => r.data)
const createItem = (data)         => api.post('/api/menu', data).then(r => r.data)
const updateItem = ({ id, data }) => api.put(`/api/menu/${id}`, data).then(r => r.data)
const deleteItem = (id)           => api.delete(`/api/menu/${id}`)
const fetchStats = ()             => api.get('/api/orders/stats').then(r => r.data)

const emptyForm = { name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true, isFeatured: false }
const STATUS_COLORS = {
  pending:   'bg-brand-warning/10 text-brand-warning  border-brand-warning/30',
  confirmed: 'bg-brand-accent/10  text-brand-accent   border-brand-accent/30',
  preparing: 'bg-purple-400/10    text-purple-400     border-purple-400/30',
  ready:     'bg-brand-success/10 text-brand-success  border-brand-success/30',
  completed: 'bg-brand-muted/10   text-brand-muted    border-brand-border',
  cancelled: 'bg-brand-danger/10  text-brand-danger   border-brand-danger/30',
}

// ── Shared form ───────────────────────────────────────────────────────────────
function MenuItemForm({ initial = emptyForm, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors(er => ({ ...er, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())        errs.name        = 'Name is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.category.trim())    errs.category    = 'Category is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = 'Enter a valid price'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) return setErrors(errs)
    onSubmit({ ...form, price: Number(form.price) })
  }

  const Field = ({ label, name, type = 'text', placeholder, as }) => (
    <div>
      <label className="block text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea name={name} value={form[name]} onChange={set} rows={3}
          placeholder={placeholder}
          className={`input resize-none ${errors[name] ? 'border-brand-danger' : ''}`} />
      ) : (
        <input type={type} name={name} value={form[name]} onChange={set}
          placeholder={placeholder}
          className={`input ${errors[name] ? 'border-brand-danger' : ''}`} />
      )}
      {errors[name] && <p className="mt-1 text-xs text-brand-danger">{errors[name]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name"      name="name"      placeholder="e.g. Wagyu Beef" />
        <Field label="Category"  name="category"  placeholder="e.g. Meats" />
        <Field label="Price ($)" name="price"     type="number" placeholder="0.00" />
        <Field label="Image URL" name="imageUrl"  placeholder="https://…" />
      </div>
      <Field label="Description" name="description" as="textarea" placeholder="Short description…" />

      <label className="flex items-center gap-3 cursor-pointer">
        <div className={`relative w-9 h-5 rounded-full transition-colors duration-200
                         ${form.isAvailable ? 'bg-brand-accent' : 'bg-brand-border'}`}>
          <input type="checkbox" name="isAvailable" checked={form.isAvailable}
            onChange={set} className="sr-only" />
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                            transition-transform duration-200
                            ${form.isAvailable ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm text-brand-muted">Available on menu</span>
      </label>

      <label className="flex items-center gap-3 cursor-pointer">
      <div className={`relative w-9 h-5 rounded-full transition-colors duration-200
                      ${form.isFeatured ? 'bg-brand-gold' : 'bg-brand-border'}`}>
        <input type="checkbox" name="isFeatured" checked={form.isFeatured}
          onChange={set} className="sr-only" />
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow
                          transition-transform duration-200
                          ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm text-brand-muted">Featured on home page ⭐</span>
    </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving…' : (initial._id ? 'Save changes' : 'Add item')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
        )}
      </div>
    </form>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminMenuPage() {
  const qc = useQueryClient()
  const { showToast } = useToast()
  const [tab, setTab]             = useState('items')
  const [editItem, setEditItem]   = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: fetchMenu,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['orderStats'],
    queryFn: fetchStats,
    enabled: tab === 'stats',
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: createItem,
    onSuccess: () => { qc.invalidateQueries(['menu']); showToast('Item added!'); setTab('items') },
    onError:   () => showToast('Failed to add item.', 'error'),
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: updateItem,
    onSuccess: () => { qc.invalidateQueries(['menu']); showToast('Item updated!'); setEditItem(null) },
    onError:   () => showToast('Failed to update item.', 'error'),
  })

  const { mutate: remove, isPending: removing } = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => { qc.invalidateQueries(['menu']); showToast('Item deleted.'); setDeleteConfirm(null) },
    onError:   () => showToast('Failed to delete item.', 'error'),
  })

  const tabs = [
    { id: 'items', label: `Menu Items (${menuItems.length})` },
    { id: 'add',   label: '+ Add New' },
    { id: 'stats', label: 'Order Stats' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-brand-primary">Admin Dashboard</h1>
        <p className="text-brand-muted text-sm mt-1">Manage menu items and order statistics</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-brand-surface border border-brand-border rounded-xl p-1 mb-8 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setEditItem(null) }}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all
                        ${tab === t.id
                          ? 'bg-brand-accent text-brand-bg shadow'
                          : 'text-brand-muted hover:text-brand-primary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Menu Items tab ───────────────────────────────────────────────── */}
      {tab === 'items' && (
        <div className="card">
          {menuLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-brand-elevated animate-pulse" />
              ))}
            </div>
          ) : menuItems.length === 0 ? (
            <div className="py-16 text-center text-brand-muted">
              <p className="text-4xl mb-3 opacity-30">🍽️</p>
              <p className="text-sm">No menu items yet.</p>
              <button onClick={() => setTab('add')} className="btn-primary mt-4">Add first item</button>
            </div>
          ) : editItem ? (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg text-brand-primary">
                  Editing: <span className="text-brand-accent">{editItem.name}</span>
                </h2>
              </div>
              <MenuItemForm
                initial={{ ...editItem, price: String(editItem.price) }}
                onSubmit={(data) => update({ id: editItem._id, data })}
                onCancel={() => setEditItem(null)}
                loading={updating}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-brand-elevated
                                          shrink-0 border border-brand-border">
                            {item.imageUrl
                              ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🍖</div>}
                          </div>
                          <span className="font-medium text-brand-primary">{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-brand-accent/10 text-brand-accent
                                         border border-brand-accent/20 text-xs">
                          {item.category}
                        </span>
                      </td>
                      <td className="font-mono text-brand-accent">${item.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge border text-xs
                                          ${item.isAvailable
                                            ? 'bg-brand-success/10 text-brand-success border-brand-success/30'
                                            : 'bg-brand-muted/10  text-brand-muted  border-brand-border'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                        {item.isFeatured && (
                        <span className="badge bg-brand-gold/10 text-brand-gold border border-brand-gold/30 text-xs ml-1">
                          ⭐ Featured
                        </span>
                      )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditItem(item)}
                            className="text-xs text-brand-muted hover:text-brand-accent transition-colors px-2 py-1">
                            Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(item._id)}
                            className="text-xs text-brand-muted hover:text-brand-danger transition-colors px-2 py-1">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add New tab ──────────────────────────────────────────────────── */}
      {tab === 'add' && (
        <div className="card max-w-2xl">
          <h2 className="text-lg text-brand-primary mb-5">Add new menu item</h2>
          <MenuItemForm onSubmit={create} loading={creating} />
        </div>
      )}

      {/* ── Stats tab ────────────────────────────────────────────────────── */}
      {tab === 'stats' && (
        <div>
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-brand-surface border border-brand-border animate-pulse" />
              ))}
            </div>
          ) : !stats ? (
            <p className="text-brand-muted text-sm">Failed to load stats.</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card flex flex-col gap-1">
                  <p className="text-xs text-brand-muted uppercase tracking-wider">Total Orders</p>
                  <p className="text-3xl font-mono text-brand-primary">{stats.totalOrders}</p>
                </div>
                <div className="card flex flex-col gap-1">
                  <p className="text-xs text-brand-muted uppercase tracking-wider">Total Revenue</p>
                  <p className="text-3xl font-mono text-brand-accent">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="card flex flex-col gap-1">
                  <p className="text-xs text-brand-muted uppercase tracking-wider">Avg. Order Value</p>
                  <p className="text-3xl font-mono text-brand-primary">
                    ${stats.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-4">
                  Orders by status
                </h3>
                <div className="space-y-3">
                  {stats.ordersByStatus.length === 0 ? (
                    <p className="text-brand-muted text-sm">No orders yet.</p>
                  ) : stats.ordersByStatus.map(({ _id: status, count }) => {
                    const pct = Math.round((count / stats.totalOrders) * 100)
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`badge border text-xs ${STATUS_COLORS[status] || 'bg-brand-muted/10 text-brand-muted border-brand-border'}`}>
                            {status}
                          </span>
                          <span className="text-xs font-mono text-brand-muted">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-brand-elevated overflow-hidden">
                          <div className="h-full rounded-full bg-brand-accent/60 transition-all duration-500"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="card-elevated max-w-sm w-full border border-brand-danger/30"
            onClick={e => e.stopPropagation()}>
            <h3 className="text-lg text-brand-primary mb-2">Delete item?</h3>
            <p className="text-brand-muted text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => remove(deleteConfirm)} disabled={removing} className="btn-danger flex-1">
                {removing ? 'Deleting…' : 'Delete'}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
