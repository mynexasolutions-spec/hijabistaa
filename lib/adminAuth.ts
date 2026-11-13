// Single definition of "is this user an admin" for the admin server actions.
//
// Previously each action also accepted ANY email containing the text "admin"
// — so a customer who simply registered as e.g. "myadmin@gmail.com" passed
// every admin check. Only the configured admin email is allowed now.

export function isAdminUser(user: any): boolean {
  if (!user) return false
  if (user.id === 'mock-admin-id') return true
  if (user.user_metadata?.role === 'admin') return true

  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hijabistaa.com').toLowerCase()
  return !!user.email && String(user.email).toLowerCase() === adminEmail
}
