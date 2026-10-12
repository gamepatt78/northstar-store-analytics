import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Box,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Download,
  LogOut,
  LayoutDashboard,
  Moon,
  MapPin,
  PackageCheck,
  Search,
  Settings2,
  ShoppingBag,
  Sun,
  UsersRound,
  X,
} from "lucide-react";
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
} from "@firebase/auth";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { auth, firebaseConfigured } from "./firebase.js";

const products = [
  { name: "Arc desk lamp", category: "Home", price: 89 },
  { name: "Weekender tote", category: "Accessories", price: 64 },
  { name: "Studio headphones", category: "Electronics", price: 149 },
  { name: "Everyday bottle", category: "Lifestyle", price: 38 },
  { name: "Linen throw", category: "Home", price: 112 },
  { name: "Field notebook set", category: "Accessories", price: 28 },
  { name: "Orbit speaker", category: "Electronics", price: 119 },
  { name: "Cedar candle trio", category: "Lifestyle", price: 52 },
];
const stores = [
  { id: "studio", name: "Studio Supply", type: "Home & design", monogram: "S" },
  { id: "field", name: "Field Notes Market", type: "Paper goods", monogram: "F" },
  { id: "morrow", name: "Morrow & Moss", type: "Everyday living", monogram: "M" },
];
const customers = [
  "Avery Chen", "Mila Patel", "Jordan Brooks", "Noah Williams",
  "Sofia Garcia", "Elliot Park", "Amara Johnson", "Theo Martin",
  "Lena Fischer", "Kai Thompson", "Nina Shah", "Owen Lewis",
  "Zara Ali", "Leo Bennett", "Ivy Wilson", "Ezra Kim",
];
const regions = ["West", "Northeast", "Midwest", "South"];
const statuses = ["Delivered", "Delivered", "Delivered", "Processing", "Shipped", "Cancelled"];
const palette = {
  Home: "#f17961",
  Accessories: "#6676d9",
  Electronics: "#36a98b",
  Lifestyle: "#e5a943",
};
const statusPalette = {
  Delivered: "#42aa88",
  Shipped: "#6676d9",
  Processing: "#e4a943",
  Cancelled: "#e17c73",
};

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const today = new Date();
const endDateDefault = dateKey(today);
const monthAgo = new Date(today);
monthAgo.setDate(today.getDate() - 29);
const dateStartDefault = dateKey(monthAgo);
const weekdayLabel = today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

const orders = Array.from({ length: 270 }, (_, index) => {
  const date = new Date(today);
  date.setDate(today.getDate() - (89 - Math.floor(index / 3)));
  const product = products[(index * 5 + Math.floor(index / 7)) % products.length];
  const quantity = index % 11 === 0 ? 2 : 1;
  return {
    id: `IZ-${String(4812 + index).padStart(5, "0")}`,
    storeId: stores[index % stores.length].id,
    date: dateKey(date),
    customer: customers[(index * 7 + Math.floor(index / 4)) % customers.length],
    product: product.name,
    category: product.category,
    region: regions[(index * 3 + Math.floor(index / 5)) % regions.length],
    status: statuses[(index * 5 + Math.floor(index / 3)) % statuses.length],
    amount: product.price * quantity,
  };
});

const formatNumber = (value) => Math.round(value).toLocaleString("en-US");
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
const formatDate = (value, options = { month: "short", day: "numeric" }) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-US", options);

const getAuthErrorMessage = (error) => {
  const messages = {
    "auth/email-already-in-use": "That email already has an account. Try signing in instead.",
    "auth/expired-action-code": "This password reset link has expired. Request a new one from the sign-in page.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-action-code": "This password reset link is invalid or has already been used. Request a new one from the sign-in page.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/too-many-requests": "There have been too many attempts. Wait a little and try again.",
    "auth/network-request-failed": "Could not reach Firebase. Check your internet connection and try again.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Authentication.",
    "auth/user-disabled": "This account has been disabled. Contact your administrator.",
    "auth/user-not-found": "No account was found for that email address.",
    "auth/wrong-password": "The email or password is incorrect.",
  };
  return messages[error.code] || error.message || "Authentication failed. Please try again.";
};

function PasswordResetPage() {
  const actionCode = new URLSearchParams(window.location.search).get("oobCode");
  const [verification, setVerification] = useState("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;

    if (!auth || !actionCode) {
      setVerification("error");
      setError(!auth
        ? "Password reset is temporarily unavailable. Please try again later."
        : "This password reset link is incomplete. Request a new one from the sign-in page.");
      return () => { active = false; };
    }

    verifyPasswordResetCode(auth, actionCode)
      .then((verifiedEmail) => {
        if (active) {
          setEmail(verifiedEmail);
          setVerification("ready");
        }
      })
      .catch((verificationError) => {
        if (active) {
          setError(getAuthErrorMessage(verificationError));
          setVerification("error");
        }
      });

    return () => { active = false; };
  }, [actionCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Those passwords do not match. Check both fields and try again.");
      return;
    }
    if (!auth || !actionCode) {
      setError("Password reset is temporarily unavailable. Please request a new link.");
      return;
    }

    setBusy(true);
    try {
      await confirmPasswordReset(auth, actionCode, password);
      setComplete(true);
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError));
    } finally {
      setBusy(false);
    }
  };

  const ready = verification === "ready";
  const heading = complete
    ? "Password updated."
    : verification === "checking"
      ? "Checking your link."
      : ready
        ? "Choose a new password."
        : "This link needs attention.";

  return (
    <main className="reset-screen">
      <div className="reset-glow reset-glow-one" aria-hidden="true" />
      <div className="reset-glow reset-glow-two" aria-hidden="true" />
      <section className="reset-layout">
        <div className="reset-story">
          <a className="brand reset-brand" href="/" aria-label="Northstar home">
            <span className="brand-mark"><Activity size={18} /></span>
            <span>northstar<span className="brand-light">.</span></span>
          </a>
          <p className="reset-story-kicker">A CLEARER VIEW OF YOUR BUSINESS</p>
          <h1>Your store,<br />in good hands.</h1>
          <p className="reset-story-copy">Securely update your password and get back to the details that move your business forward.</p>
          <div className="reset-story-mark" aria-hidden="true">✳</div>
        </div>

        <section className="reset-card" aria-labelledby="reset-title">
          <div className={`reset-icon${complete ? " reset-icon-success" : ""}`} aria-hidden="true">
            {complete ? <PackageCheck size={23} /> : <Settings2 size={23} />}
          </div>
          <p className="reset-kicker">{complete ? "ALL SET" : "ACCOUNT RECOVERY"}</p>
          <h2 id="reset-title">{heading}</h2>
          {verification === "checking" && !complete ? (
            <p className="reset-description">We’re checking that your secure reset link is valid.</p>
          ) : null}
          {ready && !complete ? (
            <>
              <p className="reset-description">Create a fresh password for <strong>{email}</strong>.</p>
              <form className="reset-form" onSubmit={handleSubmit}>
                <label htmlFor="new-password">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  required
                />
                <label htmlFor="confirm-new-password">Confirm new password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Enter your new password again"
                  required
                />
                {error && <p className="reset-feedback error" role="alert">{error}</p>}
                <button className="reset-submit" type="submit" disabled={busy || password.length < 6 || !confirmPassword}>
                  {busy ? "Updating password…" : "Save new password"}
                </button>
              </form>
              <p className="reset-security-note"><span aria-hidden="true">✓</span> Use at least 6 characters. A unique password is best.</p>
            </>
          ) : null}
          {error && !ready && !complete && <p className="reset-feedback error" role="alert">{error}</p>}
          {complete && (
            <>
              <p className="reset-description">Your password has been changed. Sign in with your new password to continue.</p>
              <a className="reset-submit reset-link" href="/">Back to sign in</a>
            </>
          )}
          {verification === "checking" && !complete && <span className="reset-loader" aria-label="Verifying reset link" />}
          {verification === "error" && (
            <a className="reset-secondary-link" href="/">Return to sign in and request a new link</a>
          )}
          <p className="reset-footnote">Your account is protected by Firebase Authentication.</p>
        </section>
      </section>
    </main>
  );
}

function App() {
  const isPasswordResetAction =
    new URLSearchParams(window.location.search).get("mode") === "resetPassword";
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(firebaseConfigured);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [startDate, setStartDate] = useState(dateStartDefault);
  const [endDate, setEndDate] = useState(endDateDefault);
  const [rangePreset, setRangePreset] = useState("30");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [regionFilter, setRegionFilter] = useState("All regions");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [activeDialog, setActiveDialog] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState("");
  const [insightIndex, setInsightIndex] = useState(0);
  const [compactRows, setCompactRows] = useState(false);
  const [showSparklines, setShowSparklines] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [theme, setTheme] = useState(() => (
    window.localStorage.getItem("northstar-theme") === "dark" ? "dark" : "light"
  ));
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0].id);
  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? stores[0];
  const selectedStoreOrderCount = orders.filter((order) => order.storeId === selectedStoreId).length;

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem("northstar-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return undefined;
    }
    return onAuthStateChanged(
      auth,
      (authenticatedUser) => {
        setUser(authenticatedUser);
        setAuthLoading(false);
      },
      (error) => {
        setAuthError(getAuthErrorMessage(error));
        setAuthLoading(false);
      },
    );
  }, []);

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.date >= startDate &&
          order.date <= endDate &&
          order.storeId === selectedStoreId &&
          (categoryFilter === "All categories" || order.category === categoryFilter) &&
          (regionFilter === "All regions" || order.region === regionFilter) &&
          (statusFilter === "All statuses" || order.status === statusFilter),
      ),
    [startDate, endDate, selectedStoreId, categoryFilter, regionFilter, statusFilter],
  );

  const summary = useMemo(() => {
    const revenue = filteredOrders.reduce((total, order) => total + order.amount, 0);
    return {
      revenue,
      orders: filteredOrders.length,
      customers: new Set(filteredOrders.map((order) => order.customer)).size,
      averageOrder: filteredOrders.length ? revenue / filteredOrders.length : 0,
    };
  }, [filteredOrders]);

  const dailySales = useMemo(() => {
    const grouped = new Map();
    filteredOrders.forEach((order) => {
      const day = grouped.get(order.date) ?? { date: order.date, revenue: 0, orders: 0 };
      day.revenue += order.amount;
      day.orders += 1;
      grouped.set(order.date, day);
    });
    return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  const categoryData = useMemo(
    () =>
      Object.keys(palette)
        .map((name) => ({
          name,
          color: palette[name],
          value: filteredOrders
            .filter((order) => order.category === name)
            .reduce((sum, order) => sum + order.amount, 0),
        }))
        .filter((item) => item.value > 0),
    [filteredOrders],
  );

  const statusData = useMemo(
    () =>
      Object.keys(statusPalette)
        .map((name) => ({
          name,
          color: statusPalette[name],
          value: filteredOrders.filter((order) => order.status === name).length,
        }))
        .filter((item) => item.value > 0),
    [filteredOrders],
  );

  const regionData = useMemo(
    () =>
      regions.map((name) => ({
        name,
        orders: filteredOrders.filter((order) => order.region === name).length,
      })),
    [filteredOrders],
  );

  const productData = useMemo(
    () =>
      products
        .map((product) => ({
          ...product,
          units: filteredOrders
            .filter((order) => order.product === product.name)
            .reduce((sum, order) => sum + (order.amount / product.price), 0),
        }))
        .filter((product) => product.units > 0)
        .sort((a, b) => b.units - a.units)
        .slice(0, 5),
    [filteredOrders],
  );

  const storeInsights = useMemo(() => {
    if (!summary.orders) {
      return ["Try widening the date range or clearing a filter to see more store activity."];
    }

    const topProduct = productData[0];
    const topRegion = [...regionData].sort((a, b) => b.orders - a.orders)[0];
    const topCategory = [...categoryData].sort((a, b) => b.value - a.value)[0];
    const deliveredOrders = statusData.find((item) => item.name === "Delivered")?.value ?? 0;

    return [
      topProduct
        ? `${topProduct.name} leads with ${formatNumber(topProduct.units)} units sold.`
        : `${formatNumber(summary.orders)} orders are in this view.`,
      topRegion
        ? `${topRegion.name} is your busiest region with ${formatNumber(topRegion.orders)} orders.`
        : `${formatNumber(summary.customers)} customers shopped this period.`,
      topCategory
        ? `${topCategory.name} brings in ${formatCurrency(topCategory.value)} in sales.`
        : `Sales total ${formatCurrency(summary.revenue)} in this view.`,
      `${formatNumber(deliveredOrders)} of ${formatNumber(summary.orders)} orders are delivered.`,
    ];
  }, [summary, productData, regionData, categoryData, statusData]);

  const visibleOrders = useMemo(
    () =>
      filteredOrders
        .filter((order) =>
          `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(search.toLowerCase()),
        )
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
        .slice(0, 7),
    [filteredOrders, search],
  );

  const applyPreset = (days) => {
    const start = new Date(today);
    start.setDate(today.getDate() - days + 1);
    setRangePreset(String(days));
    setStartDate(dateKey(start));
    setEndDate(endDateDefault);
  };

  const clearAuthFeedback = () => {
    setAuthError("");
    setAuthMessage("");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    clearAuthFeedback();
    if (!auth) {
      setAuthError("Firebase is not configured. Follow the setup steps in HOW_TO_RUN.md.");
      return;
    }

    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const credential = await createUserWithEmailAndPassword(
          auth,
          authEmail.trim(),
          authPassword,
        );
        if (authName.trim()) {
          await updateProfile(credential.user, { displayName: authName.trim() });
          setUser(credential.user);
        }
      } else {
        await signInWithEmailAndPassword(auth, authEmail.trim(), authPassword);
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    clearAuthFeedback();
    if (!auth) {
      setAuthError("Firebase is not configured. Follow the setup steps in HOW_TO_RUN.md.");
      return;
    }
    if (!authEmail.trim()) {
      setAuthError("Enter your email address first so Firebase knows where to send the reset link.");
      return;
    }

    setAuthBusy(true);
    try {
      await sendPasswordResetEmail(auth, authEmail.trim(), {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      setAuthMessage("If an account exists for that address, Firebase will send a password reset email.");
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleForgotPasswordClick = () => {
    clearAuthFeedback();
    setAuthMode("reset");
    if (authEmail.trim()) {
      void handlePasswordReset();
    }
  };

  const handleSignOut = async () => {
    setAccountMenuOpen("");
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
      setActiveDialog("auth-error");
    }
  };

  const switchAuthMode = (mode) => {
    clearAuthFeedback();
    setAuthMode(mode);
  };

  const accountName = user?.displayName || user?.email?.split("@")[0] || "Account";
  const accountInitials = (user?.displayName || user?.email || "A")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  const cards = [
    { label: "Gross sales", value: formatCurrency(summary.revenue), trend: "+12.6%", icon: CreditCard, note: "against previous period" },
    { label: "Orders placed", value: formatNumber(summary.orders), trend: "+8.3%", icon: ShoppingBag, note: "against previous period" },
    { label: "Unique customers", value: formatNumber(summary.customers), trend: "+5.1%", icon: UsersRound, note: "in this date range" },
    { label: "Average order", value: formatCurrency(summary.averageOrder), trend: "+2.4%", icon: Activity, note: "against previous period" },
  ];

  if (isPasswordResetAction) {
    return <PasswordResetPage />;
  }

  if (authLoading) {
    return (
      <main className="auth-screen">
        <button className="theme-toggle auth-theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>
        <section className="auth-card auth-loading">
          <span className="brand-mark"><Activity size={18} /></span>
          <p>Checking your account…</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-screen">
        <button className="theme-toggle auth-theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme === "light" ? "Dark" : "Light"}</span>
        </button>
        <aside className="auth-story" aria-label="Northstar">
          <a className="brand auth-story-brand" href="/" aria-label="Northstar home">
            <span className="brand-mark"><Activity size={18} /></span>
            <span>northstar<span className="brand-light">.</span></span>
          </a>
          <div className="auth-story-copy">
            <p className="auth-story-kicker">A CLEARER VIEW OF YOUR BUSINESS</p>
            <h2>Your store,<br />in good hands.</h2>
            <p>Make space for the big picture. Your sales, orders, and customer trends come together in one thoughtful view.</p>
            <div className="auth-story-tags" aria-label="Dashboard highlights">
              <span><Activity size={14} /> Store insights</span>
              <span><PackageCheck size={14} /> Secure sign-in</span>
            </div>
          </div>
          <span className="auth-story-mark" aria-hidden="true">✳</span>
        </aside>
        <section className="auth-card" aria-labelledby="auth-title">
          <a className="brand auth-brand" href="/" aria-label="Northstar home">
            <span className="brand-mark"><Activity size={18} /></span>
            <span>northstar<span className="brand-light">.</span></span>
          </a>
          <p className="dialog-kicker">
            {authMode === "signup" ? "YOUR NEXT CHAPTER" : authMode === "reset" ? "ACCOUNT RECOVERY" : "YOUR STORE, IN VIEW"}
          </p>
          <h1 id="auth-title">
            {authMode === "signup" ? "Create your account." : authMode === "reset" ? "Reset your password." : "Welcome back."}
          </h1>
          <p className="auth-description">
            {authMode === "signup"
              ? "Create an account to open your store dashboard."
              : authMode === "reset"
                ? "Firebase will email you a secure password reset link."
                : "Sign in securely to continue to your store overview."}
          </p>
          {!firebaseConfigured && (
            <div className="auth-setup-notice">
              <strong>Firebase setup is needed</strong>
              <span>Copy <code>.env.example</code> to <code>.env</code>, add your Firebase web-app config, and enable Email/Password sign-in in Firebase Console. See HOW_TO_RUN.md for details.</span>
            </div>
          )}
          {authMode === "reset" ? (
            <form className="auth-form" onSubmit={(event) => { event.preventDefault(); void handlePasswordReset(); }}>
              <label htmlFor="auth-email">Email address</label>
              <input id="auth-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" required />
              {authError && <p className="auth-feedback error" role="alert">{authError}</p>}
              {authMessage && <p className="auth-feedback success" role="status">{authMessage}</p>}
              <button className="dialog-primary" type="submit" disabled={authBusy || !firebaseConfigured}>{authBusy ? "Sending your email…" : "Send password reset email"}</button>
              <button className="auth-switch auth-back-link" type="button" onClick={() => switchAuthMode("signin")}>Back to sign in</button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "signup" && (
                <>
                  <label htmlFor="auth-name">Your name</label>
                  <input id="auth-name" type="text" autoComplete="name" value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Name" minLength={2} required />
                </>
              )}
              <label htmlFor="auth-email">Email address</label>
              <input id="auth-email" type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" required />
              <label htmlFor="auth-password">Password</label>
              <input id="auth-password" type="password" autoComplete={authMode === "signup" ? "new-password" : "current-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required />
              {authError && <p className="auth-feedback error" role="alert">{authError}</p>}
              <button className="dialog-primary" type="submit" disabled={authBusy || !firebaseConfigured}>
                {authBusy ? "Please wait…" : authMode === "signup" ? "Create account" : "Sign in securely"}
              </button>
              {authMode === "signin" && <button className="auth-switch forgot-password" type="button" onClick={handleForgotPasswordClick}>Forgot password?</button>}
              <p className="auth-switch-prompt">
                {authMode === "signup" ? "Already have an account?" : "New to Northstar?"}
                <button className="auth-switch" type="button" onClick={() => switchAuthMode(authMode === "signup" ? "signin" : "signup")}>
                  {authMode === "signup" ? "Sign in" : "Create account"}
                </button>
              </p>
            </form>
          )}
          <p className="auth-footnote">Your password is handled by Firebase Authentication.</p>
        </section>
      </main>
    );
  }

  return (
    <div className={`app-shell${compactRows ? " compact-rows" : ""}${showSparklines ? "" : " hide-sparklines"}`}>
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Northstar home">
          <span className="brand-mark"><Activity size={18} /></span>
          <span>northstar<span className="brand-light">.</span></span>
        </a>
        <label className="store-switcher">
          <span className="store-monogram">{selectedStore.monogram}</span>
          <span className="store-details"><strong>{selectedStore.name}</strong><small>{selectedStore.type}</small></span>
          <ChevronDown size={14} />
          <select aria-label="Select store" value={selectedStoreId} onChange={(event) => setSelectedStoreId(event.target.value)}>
            {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </select>
        </label>
        <p className="nav-label">YOUR BUSINESS</p>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={16} />Overview</a>
          <a className="nav-item" href="#orders"><ShoppingBag size={16} />Orders<span className="nav-count">{selectedStoreOrderCount}</span></a>
          <a className="nav-item" href="#products"><Box size={16} />Products</a>
          <a className="nav-item" href="#insights"><Activity size={16} />Insights</a>
        </nav>
        <div className="sidebar-bottom">
          <aside className="sidebar-note" aria-label="Store insights">
            <span className="note-mark" aria-hidden="true">✳</span>
            <p className="note-title">Small details.<br /><strong>Big picture.</strong></p>
            <p className="note-insight" aria-live="polite">{storeInsights[insightIndex % storeInsights.length]}</p>
            <button className="note-next" type="button" onClick={() => setInsightIndex((index) => (index + 1) % storeInsights.length)}>
              Next insight <ChevronRight size={13} />
            </button>
          </aside>
          <button className="nav-item sidebar-action" type="button" onClick={() => setActiveDialog("help")}><CircleHelp size={16} />Help & support</button>
          <button className="nav-item sidebar-action" type="button" onClick={() => setActiveDialog("settings")}><Settings2 size={16} />Preferences</button>
          <div className="profile-menu-wrap">
            {accountMenuOpen === "sidebar" && (
              <div className="account-menu sidebar-account-menu">
                <button type="button" onClick={() => { setAccountMenuOpen(""); setActiveDialog("settings"); }}><Settings2 size={15} />Account preferences</button>
                <button type="button" onClick={handleSignOut}><LogOut size={15} />Sign out</button>
              </div>
            )}
            <button className="profile-card" type="button" aria-expanded={accountMenuOpen === "sidebar"} onClick={() => setAccountMenuOpen(accountMenuOpen === "sidebar" ? "" : "sidebar")}>
              <span className="profile-avatar">{accountInitials}</span>
              <span><strong>{accountName}</strong><small>{user.email}</small></span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb">{selectedStore.name} <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-right">
            <button className="theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
              {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
            <div className="profile-menu-wrap topbar-menu-wrap">
              <button className="avatar-button" type="button" aria-label="Account menu" aria-expanded={accountMenuOpen === "topbar"} onClick={() => setAccountMenuOpen(accountMenuOpen === "topbar" ? "" : "topbar")}>{accountInitials}</button>
              {accountMenuOpen === "topbar" && (
                <div className="account-menu topbar-account-menu">
                  <div className="account-menu-heading"><strong>{accountName}</strong><small>{user.email}</small></div>
                  <button type="button" onClick={() => { setAccountMenuOpen(""); setActiveDialog("settings"); }}><Settings2 size={15} />Preferences</button>
                  <button type="button" onClick={handleSignOut}><LogOut size={15} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">{weekdayLabel}, YOUR STORE AT A GLANCE</p>
              <h1>Good things are moving.</h1>
              <p className="subtitle">A fresh look at the moments behind your numbers.</p>
            </div>
            <button className="export-button" type="button" onClick={() => window.print()}><Download size={15} />Print snapshot</button>
          </section>

          <section className="filter-bar" aria-label="Report filters">
            <div className="date-picker">
              <CalendarDays size={15} />
              <label className="visually-hidden" htmlFor="start-date">From date</label>
              <input
                id="start-date"
                type="date"
                aria-label="From date"
                min={dateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89))}
                max={endDate || endDateDefault}
                value={startDate}
                onChange={(event) => {
                  setRangePreset("custom");
                  setStartDate(event.target.value);
                }}
              />
              <span className="date-to">to</span>
              <label className="visually-hidden" htmlFor="end-date">To date</label>
              <input
                id="end-date"
                type="date"
                aria-label="To date"
                min={startDate}
                max={endDateDefault}
                value={endDate}
                onChange={(event) => {
                  setRangePreset("custom");
                  setEndDate(event.target.value);
                }}
              />
            </div>
            <div className="filter-group">
              <label className="visually-hidden" htmlFor="range-preset">Date preset</label>
              <select
                id="range-preset"
                className="filter-select range-select"
                value={rangePreset}
                onChange={(event) => {
                  if (event.target.value === "custom") {
                    setRangePreset("custom");
                  } else {
                    applyPreset(Number(event.target.value));
                  }
                }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
              <label className="visually-hidden" htmlFor="category-filter">Category</label>
              <select id="category-filter" className="filter-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option>All categories</option>
                {Object.keys(palette).map((category) => <option key={category}>{category}</option>)}
              </select>
              <label className="visually-hidden" htmlFor="region-filter">Region</label>
              <select id="region-filter" className="filter-select" value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                <option>All regions</option>
                {regions.map((region) => <option key={region}>{region}</option>)}
              </select>
              <label className="visually-hidden" htmlFor="status-filter">Order status</label>
              <select id="status-filter" className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option>
                {Object.keys(statusPalette).map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </section>

          <section className="metrics" aria-label="Store performance">
            {cards.map(({ label, value, trend, icon: Icon, note }, index) => (
              <article className={`metric-card metric-card-${index + 1}`} key={label}>
                <div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17} /></span></div>
                <div className="metric-value">{value}</div>
                <div className="metric-foot"><span className="trend"><ArrowUpRight size={13} />{trend}</span><span className="metric-note">{note}</span></div>
                <span className="metric-sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
              </article>
            ))}
          </section>

          <section className="visual-grid" id="insights">
            <article className="panel sales-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">THE BIG PICTURE</span><h2>Sales, day by day</h2><p>Revenue across your selected window</p></div>
                <div className="sales-total"><strong>{formatCurrency(summary.revenue)}</strong><span><i />Gross sales</span></div>
              </div>
              <div className="chart sales-chart">
                {dailySales.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySales} margin={{ top: 16, right: 9, left: -15, bottom: 0 }}>
                      <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f17b63" stopOpacity={0.25} /><stop offset="100%" stopColor="#f17b63" stopOpacity={0.01} /></linearGradient></defs>
                      <CartesianGrid stroke="#f0eee9" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(value) => formatDate(value)} axisLine={false} tickLine={false} tick={{ fill: "#94969e", fontSize: 10 }} dy={9} minTickGap={26} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94969e", fontSize: 10 }} tickFormatter={(value) => value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`} />
                      <Tooltip labelFormatter={(value) => formatDate(value, { month: "long", day: "numeric", year: "numeric" })} formatter={(value) => [formatCurrency(value), "Sales"]} contentStyle={{ border: "1px solid #eeece7", borderRadius: 10, boxShadow: "0 8px 24px rgba(35, 39, 54, 0.08)" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#e8755e" strokeWidth={2.5} fill="url(#salesFill)" activeDot={{ r: 5, strokeWidth: 0, fill: "#e8755e" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="empty-chart">No sales match these filters.</p>}
              </div>
            </article>

            <article className="panel status-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">FULFILMENT</span><h2>Order pulse</h2><p>Where every order stands</p></div>
                <PackageCheck className="panel-heading-icon" size={18} />
              </div>
              <div className="status-content">
                <div className="status-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="94%" paddingAngle={3} stroke="none">
                        {statusData.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip formatter={(value, name) => [formatNumber(value), name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="status-center"><strong>{formatNumber(summary.orders)}</strong><span>orders</span></div>
                </div>
                <div className="status-legend">
                  {Object.keys(statusPalette).map((status) => {
                    const count = statusData.find((item) => item.name === status)?.value ?? 0;
                    return <div className="legend-row" key={status}><span><i style={{ background: statusPalette[status] }} />{status}</span><strong>{formatNumber(count)}</strong></div>;
                  })}
                </div>
              </div>
            </article>

            <article className="panel region-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">FULFILMENT MAP</span><h2>Orders by region</h2><p>Distribution across your markets</p></div>
                <MapPin className="panel-heading-icon" size={17} />
              </div>
              <div className="chart region-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} margin={{ top: 10, right: 7, left: -22, bottom: 0 }}>
                    <CartesianGrid stroke="#f0eee9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94969e", fontSize: 10 }} dy={8} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#94969e", fontSize: 10 }} />
                    <Tooltip formatter={(value) => [formatNumber(value), "Orders"]} contentStyle={{ border: "1px solid #eeece7", borderRadius: 9 }} />
                    <Bar dataKey="orders" fill="#7380dc" radius={[5, 5, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel category-panel" id="products">
              <div className="panel-heading">
                <div><span className="section-kicker">WHAT PEOPLE LOVE</span><h2>Category mix</h2><p>Sales split by product family</p></div>
              </div>
              <div className="category-content">
                <div className="category-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius="61%" outerRadius="89%" paddingAngle={3} stroke="none">
                        {categoryData.map((item) => <Cell key={item.name} fill={item.color} />)}
                      </Pie>
                      <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="category-legend">
                  {Object.entries(palette).map(([category, color]) => {
                    const value = categoryData.find((item) => item.name === category)?.value ?? 0;
                    const percent = summary.revenue ? Math.round((value / summary.revenue) * 100) : 0;
                    return <div className="category-row" key={category}><span><i style={{ background: color }} />{category}</span><strong>{percent}%</strong></div>;
                  })}
                </div>
              </div>
            </article>
          </section>

          <section className="data-grid">
            <section className="panel orders-panel" id="orders">
              <div className="orders-heading">
                <div><span className="section-kicker">THE LATEST</span><h2>Recent orders <span className="orders-count">{formatNumber(filteredOrders.length)}</span></h2></div>
                <label className="search-box"><Search size={14} /><input aria-label="Search orders" placeholder="Find an order" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
              </div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEM</th><th>REGION</th><th>STATUS</th><th>DATE</th><th className="amount-heading">TOTAL</th></tr></thead>
                  <tbody>
                    {visibleOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="order-id">{order.id}</td>
                        <td>{order.customer}</td>
                        <td><span className="product-name">{order.product}</span><small>{order.category}</small></td>
                        <td>{order.region}</td>
                        <td><span className={`status-pill status-${order.status.toLowerCase()}`}><i />{order.status}</span></td>
                        <td>{formatDate(order.date, { month: "short", day: "numeric", year: "numeric" })}</td>
                        <td className="amount-cell">{formatCurrency(order.amount)}</td>
                      </tr>
                    ))}
                    {!visibleOrders.length && <tr><td className="empty-table" colSpan="7">No orders found. Try changing your filters.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-caption"><span>Showing {formatNumber(visibleOrders.length)} of {formatNumber(filteredOrders.length)} matching orders</span><span><Box size={13} />Illustrative demo data</span></div>
            </section>

            <aside className="panel top-products-panel">
              <div className="panel-heading">
                <div><span className="section-kicker">CUSTOMER FAVOURITES</span><h2>Product leaders</h2><p>Units sold in this period</p></div>
              </div>
              <div className="product-ranking">
                {productData.map((product, index) => {
                  const maxUnits = productData[0]?.units || 1;
                  return (
                    <div className="product-rank" key={product.name}>
                      <span className="rank-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="rank-detail">
                        <span className="rank-label"><strong>{product.name}</strong><small>{formatNumber(product.units)} units</small></span>
                        <span className="rank-track"><i style={{ width: `${(product.units / maxUnits) * 100}%` }} /></span>
                      </span>
                    </div>
                  );
                })}
                {!productData.length && <p className="empty-products">No product sales in this range.</p>}
              </div>
            </aside>
          </section>

          <footer className="page-footer"><span><span className="footer-spark">✳</span> Made for the curious.</span><button className="footer-help" type="button" onClick={() => setActiveDialog("help")}>Need a hand?</button><span>Northstar · Store overview</span></footer>
        </div>
      </main>
      {activeDialog && (
        <div className="dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActiveDialog("");
        }}>
          <section className="app-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
            <div className="dialog-heading">
              <span className="dialog-icon">{activeDialog === "settings" ? <Settings2 size={19} /> : <CircleHelp size={19} />}</span>
              <button className="dialog-close" type="button" aria-label="Close dialog" onClick={() => setActiveDialog("")}><X size={18} /></button>
            </div>
            {activeDialog === "settings" && (
              <>
                <p className="dialog-kicker">MAKE IT YOURS</p>
                <h2 id="dialog-title">Preferences</h2>
                <p className="dialog-description">Choose how your {selectedStore.name} overview looks.</p>
                <div className="settings-options">
                  <label className="setting-option"><span><strong>Compact order rows</strong><small>Fit more orders into the table.</small></span><input type="checkbox" checked={compactRows} onChange={(event) => setCompactRows(event.target.checked)} /></label>
                  <label className="setting-option"><span><strong>Metric trend details</strong><small>Show the small trend marks on summary cards.</small></span><input type="checkbox" checked={showSparklines} onChange={(event) => setShowSparklines(event.target.checked)} /></label>
                  <label className="setting-option"><span><strong>Weekly store digest</strong><small>Demo preference only; no email will be sent.</small></span><input type="checkbox" checked={weeklyDigest} onChange={(event) => setWeeklyDigest(event.target.checked)} /></label>
                </div>
                <button className="dialog-primary" type="button" onClick={() => setActiveDialog("")}>Done</button>
              </>
            )}
            {activeDialog === "help" && (
              <>
                <p className="dialog-kicker">HERE WHEN YOU NEED US</p>
                <h2 id="dialog-title">A little help?</h2>
                <p className="dialog-description">A few quick notes to help you find your way around this store demo.</p>
                <div className="help-entries">
                  <article><strong>How fresh is this data?</strong><p>It is generated sample data for the last 90 days—not live shop or customer information.</p></article>
                  <article><strong>Why did my numbers change?</strong><p>Date, category, region, and status filters all update the cards, charts, and order list together.</p></article>
                  <article><strong>How does account access work?</strong><p>Email, password, password reset, and sign-out are handled by Firebase Authentication. The store orders and workspaces are still illustrative data.</p></article>
                </div>
                <button className="dialog-primary" type="button" onClick={() => setActiveDialog("")}>Got it</button>
              </>
            )}
            {activeDialog === "auth-error" && (
              <>
                <p className="dialog-kicker">ACCOUNT NOTICE</p>
                <h2 id="dialog-title">Could not sign out</h2>
                <p className="auth-feedback error" role="alert">{authError}</p>
                <button className="dialog-primary" type="button" onClick={() => setActiveDialog("")}>Close</button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
