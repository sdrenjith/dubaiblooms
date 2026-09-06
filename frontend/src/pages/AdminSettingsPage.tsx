import axios from 'axios';
import { FormEvent, useCallback, useEffect, useId, useState } from 'react';
import { adminApi, authApi, contentApi, uploadAdminImage } from '@/lib/api';
import { notifyAdminSiteSettingsUpdated } from '@/lib/adminEvents';
import { useAdminToast } from '@/context/AdminToastContext';
import { resolveMediaSrc } from '@/lib/mediaUrl';
import { isValidSlugInput, normalizeSlugInput } from '@/lib/slug';
import type { AdminUserRow, AuthUser } from '@/lib/api';
import type { Settings } from '@/types/api';

const emptySettings: Settings = {
  siteName: '',
  tagline: '',
  logo: '',
  favicon: '',
  footerText: '',
  privacyPolicyHtml: '',
  notifications: { enabled: true, title: '', message: '' },
  contactInfo: { email: '', phone: '', address: '' },
  socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
  listing: { cardsPerPage: 4 },
  homepage: { heroAutoplayMs: 5000, categoryTiles: [], sections: [], googleReviews: [] },
};

export function AdminSettingsPage() {
  const token = localStorage.getItem('adminToken');
  const toast = useAdminToast();
  const [form, setForm] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [invitePassword2, setInvitePassword2] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('admin');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profileSlug, setProfileSlug] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [teamUsers, setTeamUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileInputId = useId();
  const avatarFileInputId = useId();

  const loadTeamUsers = useCallback(async () => {
    if (!token) {
      return;
    }
    setUsersLoading(true);
    try {
      const list = await authApi.listUsers(token);
      setTeamUsers(list);
    } catch {
      toast('error', 'Unable to load users. You may need administrator access.');
      setTeamUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await contentApi.settings();
        setForm((settings || emptySettings) as Settings);
      } catch {
        toast('error', 'Unable to load settings.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [toast]);

  useEffect(() => {
    if (!token) {
      setSessionUser(null);
      return;
    }
    const loadSession = async () => {
      try {
        const user = await authApi.getMe(token);
        setSessionUser(user);
      } catch {
        setSessionUser(null);
      }
    };
    void loadSession();
  }, [token]);

  useEffect(() => {
    if (sessionUser) {
      setProfileName(sessionUser.name);
      setProfileSlug(sessionUser.slug || '');
      setProfileBio(sessionUser.bio || '');
      setProfileAvatar(sessionUser.avatar || '');
    }
  }, [sessionUser]);

  useEffect(() => {
    if (!token || sessionUser?.role !== 'admin') {
      return;
    }
    void loadTeamUsers();
  }, [token, sessionUser?.role, loadTeamUsers]);

  if (!token) {
    return null;
  }

  const updateField = (key: keyof Settings, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildProfilePayload = (): {
    name: string;
    slug: string;
    bio: string;
    avatar: string;
  } | null => {
    const nameTrim = profileName.trim();
    const slugTrim = normalizeSlugInput(profileSlug);
    if (!nameTrim) {
      toast('error', 'Display name cannot be empty.');
      return null;
    }
    if (!isValidSlugInput(slugTrim)) {
      toast('error', 'Author slug is required. Use lowercase letters, numbers, and hyphens.');
      return null;
    }
    return {
      name: nameTrim,
      slug: slugTrim,
      bio: profileBio,
      avatar: profileAvatar.trim(),
    };
  };

  const applySavedProfile = (user: AuthUser) => {
    setSessionUser(user);
    setProfileName(user.name);
    setProfileSlug(user.slug || '');
    setProfileBio(user.bio || '');
    setProfileAvatar(user.avatar || '');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    // Profile sits on this same page above site settings; "Save all settings" must persist it too.
    let profilePayload: ReturnType<typeof buildProfilePayload> = null;
    if (sessionUser) {
      profilePayload = buildProfilePayload();
      if (!profilePayload) {
        return;
      }
    }
    setSaving(true);
    try {
      if (profilePayload) {
        const user = await authApi.updateMyProfile(token, profilePayload);
        applySavedProfile(user);
      }
      const updated = await adminApi.updateSettings(form, token);
      setForm(updated);
      toast(
        'success',
        profilePayload ? 'Settings and your author profile were saved.' : 'Settings saved successfully.'
      );
      notifyAdminSiteSettingsUpdated();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Failed to save settings. Please verify admin token/session.';
      toast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const onInviteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    if (invitePassword.length < 6) {
      toast('error', 'Password must be at least 6 characters.');
      return;
    }
    if (invitePassword !== invitePassword2) {
      toast('error', 'Passwords do not match.');
      return;
    }
    setInviteSubmitting(true);
    try {
      const created = await adminApi.registerUser(
        {
          name: inviteName.trim(),
          email: inviteEmail.trim().toLowerCase(),
          password: invitePassword,
          role: inviteRole,
        },
        token
      );
      toast('success', `Account created for ${created.email} (${created.role}). They can sign in immediately.`);
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      setInvitePassword2('');
      setInviteRole('admin');
      void loadTeamUsers();
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Could not create user. You may need to log in again as an administrator.';
      toast('error', msg);
    } finally {
      setInviteSubmitting(false);
    }
  };

  const onProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !sessionUser) {
      return;
    }
    const profilePayload = buildProfilePayload();
    if (!profilePayload) {
      return;
    }
    if (profileNewPassword) {
      if (profileNewPassword.length < 6) {
        toast('error', 'New password must be at least 6 characters.');
        return;
      }
      if (profileNewPassword !== profileConfirmPassword) {
        toast('error', 'New password and confirmation do not match.');
        return;
      }
      if (!profileCurrentPassword) {
        toast('error', 'Enter your current password to set a new one.');
        return;
      }
    }
    const unchanged =
      profilePayload.name === sessionUser.name &&
      profilePayload.slug === (sessionUser.slug || '') &&
      profilePayload.bio === (sessionUser.bio || '') &&
      profilePayload.avatar === (sessionUser.avatar || '') &&
      !profileNewPassword;
    if (unchanged) {
      toast('error', 'No changes to save.');
      return;
    }
    // Always send full profile fields so bio/slug/avatar cannot be dropped by a stale session compare.
    const payload: {
      name: string;
      slug: string;
      bio: string;
      avatar: string;
      currentPassword?: string;
      newPassword?: string;
    } = { ...profilePayload };
    if (profileNewPassword) {
      payload.currentPassword = profileCurrentPassword;
      payload.newPassword = profileNewPassword;
    }
    setProfileSubmitting(true);
    try {
      const user = await authApi.updateMyProfile(token, payload);
      applySavedProfile(user);
      toast('success', 'Your profile was updated.');
      setProfileCurrentPassword('');
      setProfileNewPassword('');
      setProfileConfirmPassword('');
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Could not update profile.';
      toast('error', msg);
    } finally {
      setProfileSubmitting(false);
    }
  };

  return (
    <div className="admin-app-panel">
        <div className="admin-screen-intro">
          <h1 className="admin-screen-title">Site settings</h1>
          <p className="lede admin-screen-lede">
            Global branding, contact, social links, and alerts. Newsletter subscribers have their own screen in the
            sidebar. Use “Site pages” to edit the home layout or each category desk.
          </p>
        </div>
        {loading ? <div className="status-banner">Loading settings...</div> : null}

        {sessionUser ? (
          <section className="admin-card admin-card-wide" style={{ marginBottom: '1.5rem' }}>
            <h2>Your account</h2>
            <p className="lede admin-hint">
              Signed in as <strong>{sessionUser.email}</strong> ({sessionUser.role}). Update your public author profile,
              display name, or password below. Email cannot be changed here. Use <strong>Save profile</strong> here, or
              <strong> Save all settings</strong> at the bottom (that also saves this author profile).
            </p>
            <form className="admin-form-grid" onSubmit={onProfileSubmit} style={{ marginTop: '0.75rem' }}>
              <label>
                Display name
                <input
                  autoComplete="name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </label>
              <label>
                Author URL slug
                <input
                  spellCheck={false}
                  value={profileSlug}
                  onChange={(e) => setProfileSlug(normalizeSlugInput(e.target.value))}
                  placeholder="your-name"
                  required
                />
                <span className="admin-hint">
                  Public page: <code>/author/{profileSlug || '…'}</code>
                </span>
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Short bio
                <textarea
                  rows={4}
                  maxLength={4000}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="A short introduction shown on your public author page"
                />
              </label>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>Profile photo</p>
                <p className="lede admin-hint" style={{ marginTop: 0 }}>
                  Circular avatar on your public author page. Upload an image or paste a URL.
                </p>
                {profileAvatar.trim() ? (
                  <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <img
                      src={resolveMediaSrc(profileAvatar)}
                      alt=""
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid #c3c4c7',
                      }}
                    />
                    <button
                      type="button"
                      className="admin-logo-remove-btn"
                      disabled={avatarUploading || profileSubmitting}
                      onClick={() => setProfileAvatar('')}
                    >
                      Remove photo
                    </button>
                  </div>
                ) : null}
                <label style={{ display: 'block', marginTop: '0.65rem' }}>
                  Image URL
                  <input
                    type="text"
                    spellCheck={false}
                    value={profileAvatar}
                    onChange={(e) => setProfileAvatar(e.target.value)}
                    placeholder="/uploads/… or https://…"
                  />
                </label>
                <div className="admin-logo-upload-wrap" style={{ marginTop: '0.65rem' }}>
                  <input
                    id={avatarFileInputId}
                    className="admin-file-input-hidden"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    disabled={avatarUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file || !token) {
                        return;
                      }
                      setAvatarUploading(true);
                      try {
                        const url = await uploadAdminImage(file, token);
                        setProfileAvatar(url);
                        toast('success', 'Photo uploaded. Click “Save profile” to keep it.');
                      } catch (err) {
                        toast('error', err instanceof Error ? err.message : 'Upload failed.');
                      } finally {
                        setAvatarUploading(false);
                      }
                    }}
                  />
                  <label
                    htmlFor={avatarFileInputId}
                    className={`admin-logo-upload-btn${avatarUploading ? ' admin-logo-upload-btn--disabled' : ''}`}
                  >
                    {avatarUploading ? 'Uploading…' : 'Upload photo'}
                  </label>
                </div>
              </div>
              <label>
                Current password (required only to change password)
                <input
                  type="password"
                  autoComplete="current-password"
                  value={profileCurrentPassword}
                  onChange={(e) => setProfileCurrentPassword(e.target.value)}
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={profileNewPassword}
                  onChange={(e) => setProfileNewPassword(e.target.value)}
                  minLength={6}
                  placeholder="Leave blank to keep current password"
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={profileConfirmPassword}
                  onChange={(e) => setProfileConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </label>
              <button className="admin-save" type="submit" disabled={profileSubmitting || avatarUploading}>
                {profileSubmitting ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          </section>
        ) : null}

        {sessionUser?.role === 'admin' ? (
          <section className="admin-card admin-card-wide" style={{ marginBottom: '1.5rem' }}>
            <h2>Invite team member</h2>
            <p className="lede admin-hint">
              Create another sign-in with administrator access, or an editor account. New users can log in from the same admin login page.
            </p>
            <form className="admin-form-grid" onSubmit={onInviteSubmit} style={{ marginTop: '0.75rem' }}>
              <label>
                Full name
                <input
                  autoComplete="name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  autoComplete="off"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                Role
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor')}>
                  <option value="admin">Administrator (full access)</option>
                  <option value="editor">Editor</option>
                </select>
              </label>
              <label>
                Temporary password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={invitePassword2}
                  onChange={(e) => setInvitePassword2(e.target.value)}
                  required
                  minLength={6}
                />
              </label>
              <button className="admin-save" type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? 'Creating…' : 'Create account'}
              </button>
            </form>
          </section>
        ) : null}

        {sessionUser?.role === 'admin' ? (
          <section className="admin-card admin-card-wide" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>Team accounts</h2>
              <button className="button-link" type="button" onClick={() => void loadTeamUsers()} disabled={usersLoading}>
                {usersLoading ? 'Refreshing…' : 'Refresh list'}
              </button>
            </div>
            <p className="lede admin-hint">
              All users who can sign in to the admin area. Each person edits their own public author profile under
              “Your account”.
            </p>
            {usersLoading && teamUsers.length === 0 ? <div className="status-banner">Loading users…</div> : null}
            {teamUsers.length > 0 ? (
              <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #c3c4c7' }}>
                      <th style={{ padding: '0.5rem 0.75rem 0.5rem 0' }}>Name</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Author slug</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Email</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Role</th>
                      <th style={{ padding: '0.5rem 0 0.5rem 0.75rem' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
                        <td style={{ padding: '0.55rem 0.75rem 0.55rem 0' }}>{u.name}</td>
                        <td style={{ padding: '0.55rem 0.75rem' }}>
                          {u.slug ? (
                            <a href={`/author/${u.slug}`} target="_blank" rel="noreferrer">
                              {u.slug}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem' }}>{u.email}</td>
                        <td style={{ padding: '0.55rem 0.75rem' }}>{u.role}</td>
                        <td style={{ padding: '0.55rem 0 0.55rem 0.75rem', color: '#646970' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !usersLoading && teamUsers.length === 0 ? (
              <p className="lede">No users returned.</p>
            ) : null}
          </section>
        ) : null}

        <form className="admin-form-grid" onSubmit={onSubmit}>
          <section className="admin-card">
            <h2>Site Identity</h2>
            <label>
              Site Name
              <input value={form.siteName || ''} onChange={(e) => updateField('siteName', e.target.value)} />
            </label>
            <label>
              Tagline
              <input value={form.tagline || ''} onChange={(e) => updateField('tagline', e.target.value)} />
            </label>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>Site logo</p>
              <p className="lede admin-hint" style={{ marginTop: 0 }}>
                Upload one image (JPEG, PNG, GIF, or WebP, max 5MB). It appears in the public header, footer, and
                this admin sidebar. If removed, the site name text is shown again.
              </p>
              {form.logo?.trim() ? (
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <img
                    src={resolveMediaSrc(form.logo)}
                    alt="Current site logo preview"
                    style={{ maxHeight: 48, maxWidth: 220, objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    className="admin-logo-remove-btn"
                    disabled={logoUploading}
                    onClick={async () => {
                      if (!token) {
                        return;
                      }
                      setLogoUploading(true);
                      try {
                        const updated = await adminApi.updateSettings({ logo: '' }, token);
                        setForm(updated);
                        toast('success', 'Logo removed. Other fields still need “Save all settings” if you changed them.');
                        notifyAdminSiteSettingsUpdated();
                      } catch {
                        toast('error', 'Could not remove logo. Try again or use Save all settings.');
                      } finally {
                        setLogoUploading(false);
                      }
                    }}
                  >
                    Remove logo
                  </button>
                </div>
              ) : null}
              <div className="admin-logo-upload-wrap">
                <input
                  id={logoFileInputId}
                  className="admin-file-input-hidden"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  disabled={logoUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file || !token) {
                      return;
                    }
                    setLogoUploading(true);
                    try {
                      const url = await uploadAdminImage(file, token);
                      const updated = await adminApi.updateSettings({ logo: url }, token);
                      setForm(updated);
                      toast('success', 'Logo uploaded and saved.');
                      notifyAdminSiteSettingsUpdated();
                    } catch (err) {
                      toast('error', err instanceof Error ? err.message : 'Upload failed.');
                    } finally {
                      setLogoUploading(false);
                    }
                  }}
                />
                <label
                  htmlFor={logoFileInputId}
                  className={`admin-logo-upload-btn${logoUploading ? ' admin-logo-upload-btn--disabled' : ''}`}
                >
                  {logoUploading ? 'Uploading…' : 'Choose image'}
                </label>
              </div>
            </div>
            <label>
              Footer Text
              <input value={form.footerText || ''} onChange={(e) => updateField('footerText', e.target.value)} />
            </label>
          </section>

          <section className="admin-card admin-card-wide">
            <h2>Privacy Policy</h2>
            <p className="admin-hint" style={{ marginTop: 0, marginBottom: '0.75rem' }}>
              Public page at <code>/privacy-policy</code>. Use HTML for headings and paragraphs (same style as story
              bodies).
            </p>
            <label>
              Policy content (HTML)
              <textarea
                className="admin-story-body-area"
                rows={18}
                value={form.privacyPolicyHtml || ''}
                onChange={(e) => updateField('privacyPolicyHtml', e.target.value)}
              />
            </label>
          </section>

          <section className="admin-card">
            <h2>Contact</h2>
            <label>
              Email
              <input
                value={form.contactInfo?.email || ''}
                onChange={(e) =>
                  updateField('contactInfo', { ...(form.contactInfo || {}), email: e.target.value })
                }
              />
            </label>
            <label>
              Phone
              <input
                value={form.contactInfo?.phone || ''}
                onChange={(e) =>
                  updateField('contactInfo', { ...(form.contactInfo || {}), phone: e.target.value })
                }
              />
            </label>
            <label>
              Address
              <input
                value={form.contactInfo?.address || ''}
                onChange={(e) =>
                  updateField('contactInfo', { ...(form.contactInfo || {}), address: e.target.value })
                }
              />
            </label>
          </section>

          <section className="admin-card">
            <h2>Social Links</h2>
            {(['facebook', 'twitter', 'instagram', 'linkedin'] as const).map((platform) => (
              <label key={platform}>
                {platform}
                <input
                  value={form.socialLinks?.[platform] || ''}
                  onChange={(e) =>
                    updateField('socialLinks', { ...(form.socialLinks || {}), [platform]: e.target.value })
                  }
                />
              </label>
            ))}
          </section>

          <section className="admin-card">
            <h2>Notifications</h2>
            <label>
              Enabled
              <select
                value={String(form.notifications?.enabled ?? true)}
                onChange={(e) =>
                  updateField('notifications', {
                    ...(form.notifications || {}),
                    enabled: e.target.value === 'true',
                  })
                }
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </label>
            <label>
              Title
              <input
                value={form.notifications?.title || ''}
                onChange={(e) =>
                  updateField('notifications', { ...(form.notifications || {}), title: e.target.value })
                }
              />
            </label>
            <label>
              Message
              <input
                value={form.notifications?.message || ''}
                onChange={(e) =>
                  updateField('notifications', { ...(form.notifications || {}), message: e.target.value })
                }
              />
            </label>
          </section>

          <button className="admin-save" type="submit" disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save all settings'}
          </button>
        </form>
    </div>
  );
}
