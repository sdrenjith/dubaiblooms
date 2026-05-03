import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { articlesAPI, categoriesAPI, uploadAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { Category } from '@/types';

const quillModules = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link', 'image'],
    ['clean'],
  ],
};

const ArticleEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featuredImage: '',
    isFeatured: false,
    isPublished: true,
    seo: { metaTitle: '', metaDescription: '', ogImage: '' },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: catData } = await categoriesAPI.getAll();
        setCategories(catData.data);

        if (!isNew && id) {
          const { data: artData } = await articlesAPI.getAllAdmin({ limit: 100 });
          const article = artData.data.find((a: any) => a._id === id);
          if (article) {
            setForm({
              title: article.title,
              excerpt: article.excerpt,
              content: article.content,
              category: typeof article.category === 'object' ? article.category._id : article.category,
              tags: article.tags?.join(', ') || '',
              featuredImage: article.featuredImage,
              isFeatured: article.isFeatured,
              isPublished: article.isPublished,
              seo: article.seo || { metaTitle: '', metaDescription: '', ogImage: '' },
            });
          }
        }
      } catch (error) {
        toast.error('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isNew]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { data } = await uploadAPI.uploadImage(file);
      setForm((prev) => ({ ...prev, featuredImage: data.data.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content || !form.category || !form.excerpt) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (isNew) {
        await articlesAPI.create(payload);
        toast.success('Article created!');
      } else {
        await articlesAPI.update(id!, payload);
        toast.success('Article updated!');
      }
      navigate('/admin/articles');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        <button onClick={() => navigate('/admin/articles')}
          className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <div className="glass-card p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Article title"
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text-primary
                  placeholder-text-muted outline-none focus:border-primary/40 transition-colors text-lg font-heading"
              />
            </div>

            <div className="glass-card p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Excerpt *</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Short description (max 300 chars)"
                rows={3}
                maxLength={300}
                className="w-full px-4 py-3 rounded-xl bg-surface-light border border-border text-text-primary
                  placeholder-text-muted outline-none focus:border-primary/40 transition-colors resize-none"
              />
            </div>

            <div className="glass-card p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Content *</label>
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
                modules={quillModules}
                placeholder="Write your article..."
              />
            </div>

            <div className="glass-card p-4 sm:p-6">
              <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">SEO Settings</h3>
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    value={form.seo.metaTitle}
                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                    placeholder="SEO title (defaults to article title)"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                      text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Meta Description</label>
                  <textarea
                    value={form.seo.metaDescription}
                    onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
                    placeholder="SEO description (defaults to excerpt)"
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                      text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className="glass-card p-4 sm:p-6">
              <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">Publish</h3>
              <div className="space-y-3 mb-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm text-text-secondary">Published</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm text-text-secondary">Featured</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full btn-primary justify-center !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <><FiSave size={16} /> {isNew ? 'Create Article' : 'Save Changes'}</>
                )}
              </button>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                  text-text-primary outline-none focus:border-primary/40 transition-colors"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                  text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
              />
              <p className="text-xs text-text-muted mt-1.5">Separate with commas</p>
            </div>

            <div className="glass-card p-4 sm:p-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Featured Image</label>
              {form.featuredImage && (
                <img
                  src={form.featuredImage.startsWith('http') ? form.featuredImage : form.featuredImage}
                  alt="Preview"
                  className="w-full h-40 rounded-xl object-cover mb-3"
                />
              )}
              <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed
                border-border text-sm text-text-muted hover:text-primary hover:border-primary/30
                transition-colors cursor-pointer">
                <FiUpload size={16} />
                Upload Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  value={form.featuredImage}
                  onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                  placeholder="Or paste image URL"
                  className="w-full px-3 py-2 rounded-lg bg-surface-light border border-border text-xs
                    text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditorPage;
