# 01: Auth Error Feedback and Menubar Identity

**What to build:**
When logging in with invalid credentials or with a disabled user account, the login screen displays an immediate, user-visible red error alert callout directly on the form explaining the specific issue, alongside notification toasts. When login succeeds or when the app silently refreshes the session, the authentication response provides the user's display name. In the top navigation bar, the active user's full name is displayed next to an unmistakable, color-coded role badge distinguishing Administrator ( Quản trị viên) from standard Staff (Nhân viên).

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Authentication API returns HTTP 401 with informative error message on incorrect password or nonexistent email
- [x] Authentication API returns HTTP 401 when account is disabled
- [x] Authentication login and refresh endpoints return the user's display name in the auth response
- [x] Login screen renders an alert banner displaying the server error message upon failed authentication
- [x] Submit button shows loading state and prevents double submission during authentication
- [x] Desktop navigation bar displays user name alongside a distinct role badge for Admin vs Staff
