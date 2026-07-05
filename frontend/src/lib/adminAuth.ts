/** Read the current admin JWT from browser storage (always call at request time, not from cached React state). */
export function readAdminToken(): string {
  return (localStorage.getItem('adminToken') || '').trim();
}

export function clearAdminSession(): void {
  localStorage.removeItem('adminToken');
}

/** Send the user back to login — used when the JWT is missing, expired, or rejected. */
export function redirectToAdminLogin(reason?: 'expired'): void {
  clearAdminSession();
  const suffix = reason === 'expired' ? '?session=expired' : '';
  window.location.assign(`/admin/login${suffix}`);
}

export function isAdminAuthFailure(status?: number, message?: string): boolean {
  if (status === 401) {
    return true;
  }
  const msg = (message || '').toLowerCase();
  return msg.includes('not authorized') || msg.includes('token invalid') || msg.includes('token expired');
}
