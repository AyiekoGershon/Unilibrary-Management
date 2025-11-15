Steps to enable Google OAuth for this project

1) Summary
- You provided Google OAuth credentials (client ID & client secret). These are stored at `supabase/google-credentials.json` in this workspace.
- Supabase needs those values in the Dashboard (Authentication → Providers → Google).
- The app uses `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })`.

2) Values (paste in Supabase Dashboard → Authentication → Providers → Google)
- Client ID: 11914725880-t7r3djabmdhgvtgmccngmovlcrbd9v1q.apps.googleusercontent.com
- Client Secret: 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

3) Redirect URIs to register in Google Cloud Console (and in Supabase if prompted)
- Local dev (for testing): http://localhost:5173/auth/callback
- Supabase callback (production): https://ytnllzhkucgraiwnoxrj.supabase.co/auth/v1/callback

4) Step-by-step (Supabase Dashboard)
- Open the Supabase project in the Dashboard (your project URL looks like `https://<project-ref>.supabase.co`).
- Go to **Authentication** → **Providers** → **Google**.
- Toggle **Enable** (if it's not already enabled).
- Paste the **Client ID** and **Client Secret** from `supabase/google-credentials.json`.
- Save changes.

5) Step-by-step (Google Cloud Console) — verify the OAuth client
- In Google Cloud Console → APIs & Services → Credentials, open the OAuth 2.0 Client you created.
- Under **Authorized redirect URIs** ensure both URIs above are present.
  - If you only added the Supabase callback earlier, add `http://localhost:5173/auth/callback` now so local dev redirects succeed.

6) Restart the dev server and test
- Restart the Vite dev server to be safe (Vite reads env at startup; Supabase provider changes are server-side so the client code does not need rebuilding, but restart doesn't hurt):

```powershell
cd C:\Projects\UNILAB
npm run dev
```

- Open: http://localhost:5173
- Click **Sign in with Google**. The browser should redirect to Google, prompt you to sign in/authorize, then return to `http://localhost:5173/auth/callback` and your app will pick up the session.
- If you are returned to `http://localhost:5173` directly, the app still calls `supabase.auth.getSessionFromUrl()` on load and will capture the session.

7) Troubleshooting
- If you get a 401/403 when performing DB queries after sign-in: verify your RLS policies allow `authenticated` users (your migration used `TO authenticated`). That requires the request to include a valid JWT (which signing in with Google provides).
- If the redirect fails with "redirect_uri_mismatch": add the exact redirect URI shown in the error to Google Cloud Console and to the Supabase provider settings.
- If Google sign-in page shows your app is unverified: you may need to publish the app or test with a Gmail account allowed in OAuth consent screen during development.

8) Security notes
- `supabase/google-credentials.json` contains secrets. After you finish setup, consider removing it from the repository and storing credentials in a secrets manager or only in the Supabase Dashboard.
- Add the file to `.gitignore` if you don't want to commit it. Example entry:

```
# local supabase oauth credentials
supabase/google-credentials.json
```

9) Want me to apply the setup for you?
- I cannot directly update your Supabase Dashboard from this environment. If you want, I can:
  - Add the `.gitignore` entry for you and remove the JSON file from the repo.
  - Or attempt a programmatic sign-in test from this environment (it won't complete Google interactive OAuth)."