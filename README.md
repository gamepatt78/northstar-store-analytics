# Northstar Store Analytics

A responsive retail analytics dashboard built with React, Vite, Recharts, and Firebase Authentication.

Northstar brings store performance into one view with sales summaries, interactive charts, product rankings, and recent orders.

**Live demo:** [infozatech-analytics.web.app](https://infozatech-analytics.web.app)

> **Demo data:** Store names, orders, customers, and performance metrics are generated examples. Firebase Authentication provides real account sign-in, but the dashboard is not yet connected to a live commerce data source.

## Features

- Sales, order, customer, and average-order summary cards
- Interactive sales, category, fulfilment, and regional visualizations
- Date, store, category, region, and order-status filters
- Searchable recent-orders table and product rankings
- Light and dark themes, with the selected theme remembered in the browser
- Interactive store insights based on current filters
- Firebase email/password account creation, sign-in, password reset, and sign-out
- A branded password-reset page for secure Firebase reset links
- Modern sign-in and registration screens with responsive styling
- Responsive desktop, tablet, and mobile layouts
- Readable dashboard typography with high-contrast store and filter menus

## Tech stack

- React 19
- Vite
- Recharts
- Firebase Authentication
- Lucide React

## Requirements

- Node.js 20 or newer
- npm
- A Firebase project to enable account sign-in

## Run locally

Install dependencies:

```bash
npm install
```

In Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`:

```powershell
npm.cmd install
```

### Configure Firebase Authentication

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Register a Web app in **Project settings** and copy its web-app configuration.
3. Enable **Email/Password** in **Authentication → Sign-in method**.
4. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Replace the placeholders in `.env` with the values from your Firebase web app:

   ```text
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

6. Start or restart the dev server after changing `.env`:

   ```bash
   npm run dev
   ```

   On Windows PowerShell:

   ```powershell
   npm.cmd run dev
   ```

Vite prints the local address, usually `http://localhost:5173`.

Add `localhost` under Firebase **Authentication → Settings → Authorized domains** if Firebase asks you to authorize the development host.

### Use the branded password-reset page

The app includes a responsive Northstar page that verifies Firebase password-reset links and lets the user choose a new password. To use it instead of Firebase's default action page:

1. In Firebase Console, open **Authentication → Templates → Password reset** and edit the template.
2. Set its **Action URL** (custom action handler URL) to the deployed app origin, for example `https://infozatech-analytics.web.app/`.
3. In **Authentication → Settings → Authorized domains**, make sure `infozatech-analytics.web.app` is authorized.
4. Save the template, then request a **new** reset email. Previously sent emails still contain their original action link.

The app verifies the one-time action code with Firebase before displaying the password form and applies the new password through Firebase Authentication.

On the sign-in screen, choose **Forgot password?**. If an email address is already entered, the app sends the reset email immediately; otherwise, enter the account email on the recovery screen and choose **Send password reset email**. Firebase only sends a link for an existing account, and the UI uses a generic confirmation for privacy.

## Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated static site is placed in `dist/`.

## Deploy to Firebase Hosting

Install and sign in to the Firebase CLI:

```bash
npm install --global firebase-tools
firebase login
```

Initialize Hosting from the project directory. Choose the Firebase project, set the public directory to `dist`, and configure the app as a single-page application:

```bash
firebase init hosting
```

Build and deploy:

```bash
npm run build
firebase deploy --only hosting
```

Add the deployed domain under Firebase **Authentication → Settings → Authorized domains**. See [HOW_TO_RUN.md](./HOW_TO_RUN.md) for Windows-specific setup and troubleshooting.

For GitHub Actions deployments, add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` as repository Actions variables under **Settings → Secrets and variables → Actions → Variables** before pushing to `main`. The local `.env` file is not uploaded to GitHub Actions. Workflows stop before deployment if any required Firebase variable is missing, preventing an unconfigured build from replacing the live site. Keep the Firebase Hosting service-account credential in Actions **secrets**. A successful deployment is available at [https://infozatech-analytics.web.app](https://infozatech-analytics.web.app).

## Security and data notes

- `.env` is excluded from Git. Do not commit it or share private server credentials.
- Firebase web-app settings are client configuration; they do not replace authentication-aware data access rules.
- The selected store and its orders are still local sample data. Authentication does not make those sample records private or user-specific.
- Before connecting real customer or order data, use a trusted backend or a properly secured data service with user-scoped access rules.

## Project guides

- [How to run the app](./HOW_TO_RUN.md)
- [How the dashboard works](./HOW_IT_WORKS.md)
