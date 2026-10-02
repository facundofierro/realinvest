# Wallet native authentication

The web wallet continues to use Auth.js cookie sessions. The static Capacitor and
Tauri bundles use the parallel native flow below because they have no Next.js
server to execute server actions or validate a cookie session.

## Flow

1. The shared `useAppSession()` hook detects the runtime. Web calls Auth.js as
   before; Capacitor and Tauri create a random `state` and open the system
   browser at `GET /api/auth/native/start`.
2. The API validates the only allow-listed callback,
   `realinvestwallet://auth-callback`, and runs the existing Google/Auth.js
   flow. Google therefore only ever redirects to the deployed HTTPS wallet
   origin.
3. On completion, the API creates a one-use code expiring in two minutes and
   redirects the browser to `realinvestwallet://auth-callback?code=…&state=…`.
4. Capacitor receives the URL through `@capacitor/app`; Tauri receives it
   through its deep-link plugin. The app checks the scheme, host, and state,
   then exchanges the code over HTTPS at `POST /api/auth/native/token`.
5. The API returns a 15-minute signed access JWT plus a 30-day opaque refresh
   token. Native API and tRPC requests send the access JWT as a Bearer token.

Capacitor opens the browser with `@capacitor/browser` and stores the session in
Keychain (iOS) / Android Keystore-encrypted preferences through
`@aparajita/capacitor-secure-storage`. Tauri opens the default browser through
the opener plugin and stores the session in its Stronghold vault.

## Refresh and revocation

The client refreshes shortly before access-token expiry and retries one native
request after a 401. `POST /api/auth/native/refresh` consumes and rotates the
refresh token. Reuse of an already consumed token revokes that user's active
native refresh tokens and requires a full sign-in. Native sign-out calls
`POST /api/auth/native/revoke` before clearing local storage (local clear is
best-effort even when offline). Server handlers accept the Bearer token first,
then retain the existing Auth.js cookie fallback for web users.

## Configuration

`NEXT_PUBLIC_API_URL` must be the public HTTPS wallet API origin when building
the static native bundle. It is included in Turbo's global environment cache
inputs. `AUTH_SECRET` signs the native access JWT as well as Auth.js state.
The redirect allow-list is intentionally hard-coded in `lib/native-auth.ts`;
any new scheme must be added there and registered in every native shell.

## Known limitations

- Token-reuse detection revokes active native sessions for the user; there is
  not yet a per-device session list or user-facing device revocation UI.
- This pass does not add biometric re-locking on top of secure storage.
- Sign-in deliberately leaves the app for the system browser.
- Desktop/mobile store signing, publishing, and release packaging are out of
  scope.
