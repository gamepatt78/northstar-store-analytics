# How to Run the Northstar Dashboard

## Live demo

The deployed app is available at [https://infozatech-analytics.web.app](https://infozatech-analytics.web.app).

## Requirements

- Node.js (version 20 or newer recommended)
- npm, which is included with Node.js

Check that Node.js and npm are available in PowerShell:

```powershell
node --version
npm.cmd --version
```

## Install dependencies

Open PowerShell and move to the project folder:

```powershell
Set-Location -LiteralPath "C:\Users\rainc\Downloads\Projects(intern)\Projects(intern)\InfozaTech\infozatech-analytics"
```

Install the project dependencies:

```powershell
npm.cmd install
```

Using `npm.cmd` in PowerShell avoids the common Windows script execution policy error caused by the `npm.ps1` wrapper.

## Enable real account sign-in with Firebase

The app uses Firebase Authentication for email/password registration, sign-in, password reset, and sign-out. A SQL database is not required. Dashboard orders and the three store choices are still generated sample data; Firebase Authentication does not turn them into private, per-user store records.

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. In **Project settings**, register a Web app and copy its web configuration.
3. Open **Authentication → Sign-in method** and enable **Email/Password**.
4. In PowerShell, create your local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```
5. Open `.env` and replace each placeholder with the matching Firebase web-app value:

   ```text
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=...
   ```
6. Start (or restart) Vite with `npm.cmd run dev`, then create your account from the sign-in screen.

If sign-in reports an authorized-domain error, add your development host (usually `localhost`) under **Authentication → Settings → Authorized domains** in Firebase Console. For a deployed app, add its domain there as well.

The local `.env` file is excluded from Git. Firebase web configuration is used by the browser app; protect any future private server credentials separately and configure Firebase security rules before storing private store data in Firestore.

### Configure GitHub Actions deployments

The Firebase Hosting workflow builds the app in GitHub Actions, where the local `.env` file is not available. Add these four **repository Actions variables** under **Settings → Secrets and variables → Actions → Variables** so the deployed sign-in screen receives the Firebase web-app config:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`

These are Firebase web-app client configuration values, not server credentials. Save the variables before pushing a change to `main` to run the Hosting deployment again. Keep private service-account credentials in **Actions secrets**, not variables.

The GitHub Actions deployment workflow expects the Hosting service-account credential in the `FIREBASE_SERVICE_ACCOUNT_INFOZATECH_ANALYTICS` repository secret. If the Firebase Actions variables are missing, a GitHub-triggered build cannot initialize Firebase Authentication correctly.

## Start the development server

```powershell
npm.cmd run dev
```

Vite prints a local URL in the terminal, usually `http://localhost:5173`. Open that URL in a browser. Keep the terminal open while using the development server; press **Ctrl+C** in that terminal to stop it.

## Other commands

Build an optimized production version:

```powershell
npm.cmd run build
```

Preview the production build locally after building:

```powershell
npm.cmd run preview
```

## If a command fails

- **`Missing script: "dev"`**: make sure PowerShell is in the `infozatech-analytics` folder and that its `package.json` includes the `dev` script.
- **`npm.ps1 cannot be loaded`**: use `npm.cmd` instead of `npm`.
- **Port already in use**: Vite may offer another local port in the terminal. Open the URL it provides.
