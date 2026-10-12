# Northstar Store Analytics

A responsive retail analytics dashboard built with React, Vite, Recharts, and Firebase Authentication.

Northstar brings store performance into one view with sales summaries, interactive charts, product rankings, and recent orders.

> **Demo data:** Store names, orders, customers, and performance metrics are generated examples. Firebase Authentication provides real account sign-in, but the dashboard is not yet connected to a live commerce data source.

## Features

- Sales, order, customer, and average-order summary cards
- Interactive sales, category, fulfilment, and regional visualizations
- Date, store, category, region, and order-status filters
- Searchable recent-orders table and product rankings
- Light and dark themes, with the selected theme remembered in the browser
- Interactive store insights based on current filters
- Firebase email/password account creation, sign-in, password reset, and sign-out
- Responsive desktop, tablet, and mobile layouts

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

## Security and data notes

- `.env` is excluded from Git. Do not commit it or share private server credentials.
- Firebase web-app settings are client configuration; they do not replace authentication-aware data access rules.
- The selected store and its orders are still local sample data. Authentication does not make those sample records private or user-specific.
- Before connecting real customer or order data, use a trusted backend or a properly secured data service with user-scoped access rules.

## Project guides

- [How to run the app](./HOW_TO_RUN.md)
- [How the dashboard works](./HOW_IT_WORKS.md)
