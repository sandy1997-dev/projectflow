# OAuth Setup Guide

The Google and GitHub sign-in buttons work once you add credentials.
Email/password login always works without OAuth setup.

---

## Google OAuth

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add Authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy **Client ID** and **Client Secret** to `.env`:
   ```
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-secret"
   ```

---

## GitHub OAuth

1. Go to: https://github.com/settings/applications/new
2. Fill in:
   - **Application name**: ProjectFlow
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**
4. Copy **Client ID** and generate **Client Secret**, add to `.env`:
   ```
   GITHUB_CLIENT_ID="your-client-id"
   GITHUB_CLIENT_SECRET="your-secret"
   ```

---

## After adding credentials

Restart the server:
```
Ctrl+C
npm run dev
```

The OAuth buttons will now work. ✅
