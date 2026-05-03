import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { settingsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { Settings } from '@/types';

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await settingsAPI.get();
        setSettings(data.data);
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const InputField = ({ label, value, onChange, placeholder }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
          text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors"
      />
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary">Settings</h1>
          <p className="text-text-muted text-sm mt-1">Configure your site</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary justify-center disabled:opacity-50">
          {isSaving ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <><FiSave size={16} /> Save Settings</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">General</h3>
          <div className="space-y-4 sm:space-y-5">
            <InputField label="Site Name" value={settings.siteName}
              onChange={(v) => setSettings({ ...settings, siteName: v })} />
            <InputField label="Tagline" value={settings.tagline}
              onChange={(v) => setSettings({ ...settings, tagline: v })} />
            <InputField label="Logo URL" value={settings.logo}
              onChange={(v) => setSettings({ ...settings, logo: v })} placeholder="/uploads/logo.png" />
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">Contact Info</h3>
          <div className="space-y-4 sm:space-y-5">
            <InputField label="Email" value={settings.contactInfo.email}
              onChange={(v) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: v } })} />
            <InputField label="Phone" value={settings.contactInfo.phone}
              onChange={(v) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: v } })} />
            <InputField label="Address" value={settings.contactInfo.address}
              onChange={(v) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: v } })} />
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">Social Links</h3>
          <div className="space-y-4 sm:space-y-5">
            <InputField label="Facebook" value={settings.socialLinks.facebook}
              onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: v } })} />
            <InputField label="Twitter" value={settings.socialLinks.twitter}
              onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, twitter: v } })} />
            <InputField label="Instagram" value={settings.socialLinks.instagram}
              onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: v } })} />
            <InputField label="LinkedIn" value={settings.socialLinks.linkedin}
              onChange={(v) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, linkedin: v } })} />
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6">
          <h3 className="font-heading font-bold text-text-primary mb-4 sm:mb-5">Footer</h3>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Footer Text</label>
              <textarea
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-light border border-border text-sm
                  text-text-primary placeholder-text-muted outline-none focus:border-primary/40 transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
