# How the Northstar Store Dashboard Works

## Project structure

- `index.html` provides the browser page shell and React root.
- `src/main.jsx` starts the React app and loads the styles.
- `src/App.jsx` contains the fictional store data, filters, metric calculations, charts, and order list.
- `src/index.css` defines the visual design, mobile and tablet layouts, and print styles.
- `src/firebase.js` initializes Firebase Authentication only when the required local config values are present.
- `.env.example` lists the Firebase web-app configuration keys. Put actual values in your ignored local `.env` file.
- `package.json` contains the app dependencies and commands.

## Sample store data

The dashboard is not connected to a shop or payment service. It generates 270 illustrative orders over the last 90 days and divides them between three selectable fictional stores: **Studio Supply**, **Field Notes Market**, and **Morrow & Moss**. The sample orders include customers, products, categories, regions, order statuses, dates, and totals.

Product and customer details are made-up examples. Store choices and order records exist in frontend sample data and are not private per-account records.

The deployed dashboard is available at [infozatech-analytics.web.app](https://infozatech-analytics.web.app). Dashboard labels use larger text for readability; the native store and filter option lists use dark text on a light background for contrast.

## Filters

- **Date range** can be set with the calendar inputs or the 7-, 30-, and 90-day presets.
- **Category** limits results to a product category.
- **Region** limits results to a sales region.
- **Order status** limits results to a fulfilment state.
- **Find an order** searches the displayed recent-order list by order number, customer, or product.
- **Store picker** switches among the three example stores and filters the dashboard to the selected store.
- **Dark / Light** switches the appearance and remembers the choice in this browser.

Date, category, region, and status filters all act on the same orders. As a result, changing them updates the KPI cards, sales chart, order-status donut, regional chart, category chart, and recent-orders table together.

## Metrics and visualizations

- **Gross sales** adds the totals for matching orders.
- **Orders placed** counts matching orders.
- **Unique customers** counts distinct customer names in the filtered orders.
- **Average order** divides gross sales by order count, or displays zero when there are no matching orders.
- **Sales, day by day** uses an area chart to show daily revenue.
- **Order pulse** uses a donut chart to show the number of orders in each status.
- **Orders by region** compares order counts across regions.
- **Category mix** shows each category's share of gross sales.

Charts are rendered with Recharts. No-data messages and zero values are shown when filters return no orders.

## Print snapshot

**Print snapshot** opens the browser print dialog. Navigation and filters are hidden in print styles. The button does not create a separate downloadable report.

## Preferences, help, and account

- **Preferences** opens display options for compact order rows and metric sparkline decorations. The weekly digest switch is an example preference only; it does not send email.
- **Help & support** opens notes about the sample data, filters, and connecting a real store.
- **Create account**, **Sign in**, **Forgot password**, and **Sign out** use Firebase Authentication with email and password. The sign-in page requires the Firebase setup described in `HOW_TO_RUN.md`; without it, the dashboard remains signed out.
- Firebase Authentication does not require a SQL database. This project does not yet use Firestore or persist private store/order records. Add Firestore and user-scoped security rules separately before storing real customer or order data.

The Firebase web config is public client configuration, not a substitute for data access rules. Never put server credentials in frontend code. To connect a real store, fetch its records through a trusted backend or configure a secured data service with authenticated, user-scoped access.
