export const AUTH_COOKIE = 'praise_auth'
export const AUTH_MAX_AGE = 60 * 60 * 24 * 365

// 認証情報から値を作るので、パスワードを変えると全員のログインが無効になる
export async function authToken(user: string, pass: string): Promise<string> {
  const data = new TextEncoder().encode(`${user}:${pass}:praise-app`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('')
}
