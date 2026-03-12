# Google Login Setup

## 1. Install the new backend dependency

Run this in `server`:

```powershell
npm install
```

This project now expects `google-auth-library` from `server/package.json`.

## 2. Create a Google OAuth client

In Google Cloud Console:

1. Open `APIs & Services` -> `Credentials`.
2. Click `Create Credentials` -> `OAuth client ID`.
3. Choose `Web application`.
4. Add your frontend origins under `Authorized JavaScript origins`.

Local examples:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

Production example:

- `https://your-frontend-domain.com`

You do not need a redirect URI for the button flow used here.

## 3. Add environment variables

In `server/.env` add:

```env
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

In `client/.env` add:

```env
VITE_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Use the same Google client ID in both places.

## 4. Restart both apps

Restart the backend and frontend after adding env vars.

Backend:

```powershell
cd server
npm start
```

Frontend:

```powershell
cd client
npm run dev
```

## 5. Optional production notes

- Add your deployed frontend domain to `Authorized JavaScript origins`.
- Set `VITE_BASE_URL` to your deployed backend URL.
- Set `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` in your hosting provider env settings.

## 6. Behavior to expect

- New Google users are created automatically.
- Existing email users can attach Google login to the same email.
- Accounts created with Google and no password must continue using Google sign-in unless you later add a password reset/set-password flow.
