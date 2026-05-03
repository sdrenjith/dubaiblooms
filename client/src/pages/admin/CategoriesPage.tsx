import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { categoriesAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { Category } from '@/types';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', order: 0 });

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesAPI.getAll();
      setCategories(data.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', order: 0 });
    setEditingId(null);
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (editingId) {
        await categoriesAPI.update(editingId, form);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(form);
        toast.success('Category created');
      }
      resetForm();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat._id);
    setShowNew(false);
    setForm({ name: cat.name, description: cat.description, order: cat.order });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Categories</h1>
          <p className="text-text-muted text-sm mt-1">Organize your content</p>
        </div>
        <button onClick={() => { setShowNew(true); setEditingId(null); setForm({ name: '', description: '', order: 0 }); }}
          className="btn-primary justify-center">
          <FiPlus size={18} /> Add Category
        </button>
      </div>

      {(showNew || editingId) && (
        <div className="glass-card p-4 sm:p-6 mb-6">
          <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">
            {editingId ? 'Edit Category' : 'New Category'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
              className="px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
            />
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              placeholder="Order"
              className="px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5">
            <button onClick={handleSave} className="btn-primary !py-2">
              <FiSave size={14} /> Save
            </button>
            <button onClick={resetForm} className="btn-secondary !py-2">
              <FiX size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Name</th>
                <th className="text-left p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Description</th>
                <th className="text-center p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Order</th>
                <th className="text-right p-3 sm:p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="p-3 sm:p-4 text-sm font-medium text-text-primary">{cat.name}</td>
                  <td className="p-3 sm:p-4 text-xs text-text-muted hidden md:table-cell">{cat.slug}</td>
                  <td className="p-3 sm:p-4 text-xs text-text-muted hidden lg:table-cell">{cat.description || '-'}</td>
                  <td className="p-3 sm:p-4 text-center text-xs text-text-muted">{cat.order}</td>
                  <td className="p-3 sm:p-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(cat)}
                        className="p-2 rounded-lg text-text-muted hover:text-blue-400 transition-colors cursor-pointer">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cat._id, cat.name)}
                        className="p-2 rounded-lg text-text-muted hover:text-red-400 transition-colors cursor-pointer">
                        <FiTrash2 size={14} />
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
    </div>
  );
};

export default CategoriesPage;
