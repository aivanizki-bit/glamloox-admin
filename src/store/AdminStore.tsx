import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { products as seedProducts, type Product } from '../data/products';
import { courses as seedCourses, type Course } from '../data/courses';
import { events as seedEvents, type LiveEvent } from '../data/events';
import { members as seedMembers, posts as seedPosts, type Member, type Post } from '../data/community';
import { initialOrders, demoUser } from '../data/user';

// ── Admin-Typen ───────────────────────────────────────
export interface AdminProduct extends Product {
  active: boolean;
  stock: number;
}
export interface AdminCourse extends Course {
  published: boolean;
  enrollments: number;
}
export interface AdminEvent extends LiveEvent {
  published: boolean;
}
export interface AdminMember extends Member {
  verified: boolean;
}
export interface AdminPost extends Post {
  hidden: boolean;
}
export type OrderStatus = 'bestätigt' | 'versandt' | 'geliefert' | 'storniert';
export interface AdminOrder {
  id: string;
  dateISO: string;
  customer: string;
  status: OrderStatus;
  items: { productId: string; qty: number; price: number; variantName?: string }[];
  total: number;
}
export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  target: 'alle' | 'kunden' | 'community' | 'academy';
  sentISO: string;
}
export interface AdminState {
  products: AdminProduct[];
  courses: AdminCourse[];
  events: AdminEvent[];
  members: AdminMember[];
  posts: AdminPost[];
  orders: AdminOrder[];
  outbox: AdminNotification[];
  rewardPoints: number;
}

// ── Seed aus den Prototyp-Daten ───────────────────────
const stockFor = (i: number): number => 12 + ((i * 17) % 40);
const extraOrders: AdminOrder[] = [
  { id: 'GLX-10201', dateISO: '2026-09-27', customer: 'Marie Sommer', status: 'geliefert', items: [{ productId: 'booster-set', qty: 1, price: 89 }], total: 89 },
  { id: 'GLX-10210', dateISO: '2026-10-02', customer: 'Sophie Wagner', status: 'versandt', items: [{ productId: 'pads-fusion', qty: 2, price: 18.99 }, { productId: 'oko-balm-glue', qty: 1, price: 18 }], total: 55.98 },
  { id: 'GLX-10228', dateISO: '2026-10-11', customer: 'Jules Berger', status: 'bestätigt', items: [{ productId: 'elan-try-me', qty: 1, price: 109.11 }], total: 109.11 },
  { id: 'GLX-10235', dateISO: '2026-10-25', customer: 'Aylin Kaya', status: 'storniert', items: [{ productId: 'noemi-dual-timer', qty: 1, price: 18.9 }], total: 18.9 },
];
const seedOrders: AdminOrder[] = [
  ...initialOrders.map((o) => ({
    id: o.id,
    dateISO: o.dateISO,
    customer: demoUser.name,
    status: (o.status === 'geliefert' ? 'geliefert' : 'versandt') as OrderStatus,
    items: o.items,
    total: o.total,
  })),
  ...extraOrders,
].sort((a, b) => b.dateISO.localeCompare(a.dateISO));

function buildSeed(): AdminState {
  return {
    products: seedProducts.map((p, i) => ({ ...p, active: true, stock: stockFor(i) })),
    courses: seedCourses.map((c) => ({ ...c, published: true, enrollments: c.students })),
    events: seedEvents.map((e) => ({ ...e, published: true })),
    members: seedMembers.map((m) => ({ ...m, verified: !!m.academy })),
    posts: seedPosts.map((p) => ({ ...p, hidden: false })),
    orders: seedOrders,
    outbox: [
      {
        id: 'ob1',
        title: 'Winter-Pflege-Tipps 💙',
        body: 'Unsere Booster-Routine für die kalten Monate – jetzt im Blog.',
        target: 'alle',
        sentISO: '2026-11-10',
      },
    ],
    rewardPoints: demoUser.rewardPoints,
  };
}

const KEY = 'glamloox-admin-data-v1';

function load(): AdminState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...buildSeed(), ...JSON.parse(raw) };
  } catch {
    /* Demo */
  }
  return buildSeed();
}

export const eur = (n: number): string =>
  n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

export interface ToastItem {
  id: number;
  msg: string;
  kind: 'success' | 'info' | 'error';
}

export interface AdminContextValue extends AdminState {
  authed: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  toasts: ToastItem[];
  toast: (msg: string, kind?: ToastItem['kind']) => void;
  dismissToast: (id: number) => void;
  // Produkte
  updateProduct: (id: string, patch: Partial<Pick<Product, 'price' | 'badge' | 'shortTitle' | 'blurb'>> & { active?: boolean; stock?: number }) => void;
  addProduct: (p: { shortTitle: string; vendor: string; price: number; category: string; stock: number }) => void;
  deleteProduct: (id: string) => void;
  // Kurse
  updateCourse: (id: string, patch: { published?: boolean; price?: number }) => void;
  // Events
  updateEvent: (id: string, patch: { published?: boolean; price?: number; seats?: string; dateISO?: string }) => void;
  addEvent: (e: { title: string; subtitle: string; dateISO: string; time: string; location: string; online: boolean; price: number; seats: string }) => void;
  deleteEvent: (id: string) => void;
  // Community
  togglePostHidden: (id: string) => void;
  deletePost: (id: string) => void;
  toggleVerified: (memberId: string) => void;
  // Bestellungen
  setOrderStatus: (id: string, status: OrderStatus) => void;
  // Mitteilungen
  sendNotification: (title: string, body: string, target: AdminNotification['target']) => void;
  deleteNotification: (id: string) => void;
  // Rewards
  setRewardPoints: (v: number) => void;
  // System
  resetAll: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

const Ctx = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(load);
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('glx-admin-auth') === '1');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastId = { current: 1 };

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* Demo */
    }
  }, [state]);

  const toast = useCallback((msg: string, kind: ToastItem['kind'] = 'success') => {
    const id = toastId.current++;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const login = useCallback((user: string, pass: string) => {
    const ok = user.trim().toLowerCase() === 'admin' && pass === 'glam';
    if (ok) {
      sessionStorage.setItem('glx-admin-auth', '1');
      setAuthed(true);
    }
    return ok;
  }, []);
  const logout = useCallback(() => {
    sessionStorage.removeItem('glx-admin-auth');
    setAuthed(false);
  }, []);

  const value: AdminContextValue = {
    ...state,
    authed,
    login,
    logout,
    toasts,
    toast,
    dismissToast,
    updateProduct: (id, patch) =>
      setState((s) => ({ ...s, products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
    addProduct: (p) =>
      setState((s) => ({
        ...s,
        products: [
          {
            id: 'neu-' + Date.now(),
            handle: 'neu-' + Date.now(),
            title: p.shortTitle,
            shortTitle: p.shortTitle,
            vendor: p.vendor,
            price: p.price,
            category: p.category as Product['category'],
            badge: 'Neu',
            blurb: 'Neu angelegt im Admin (Demo).',
            variants: [],
            images: ['https://cdn.shopify.com/s/files/1/0639/5812/2716/files/glam1236_1.jpg?width=800'],
            active: true,
            stock: p.stock,
          },
          ...s.products,
        ],
      })),
    deleteProduct: (id) => setState((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) })),
    updateCourse: (id, patch) =>
      setState((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    updateEvent: (id, patch) =>
      setState((s) => ({ ...s, events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
    addEvent: (e) =>
      setState((s) => ({
        ...s,
        events: [
          {
            ...e,
            id: 'ev-neu-' + Date.now(),
            subtitle: e.subtitle || 'Neu angelegt im Admin',
            priceNote: 'Admin-Demo',
            host: 'GLAMLOOX Admin',
            image: 'https://cdn.shopify.com/s/files/1/0639/5812/2716/files/Haarband_Glamloox1.png?width=1200',
            description: 'Im Admin-Konsole angelegtes Event (Demo).',
            agenda: [{ time: '10:00', point: 'Detailangaben folgen' }],
            realBasis: 'Demo-Eintrag aus der Admin-Konsole.',
            published: true,
          },
          ...s.events,
        ],
      })),
    deleteEvent: (id) => setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) })),
    togglePostHidden: (id) =>
      setState((s) => ({ ...s, posts: s.posts.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)) })),
    deletePost: (id) => setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== id) })),
    toggleVerified: (memberId) =>
      setState((s) => ({ ...s, members: s.members.map((m) => (m.id === memberId ? { ...m, verified: !m.verified } : m)) })),
    setOrderStatus: (id, status) =>
      setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
    sendNotification: (title, body, target) =>
      setState((s) => ({
        ...s,
        outbox: [{ id: 'ob' + Date.now(), title, body, target, sentISO: new Date().toISOString().slice(0, 10) }, ...s.outbox],
      })),
    deleteNotification: (id) => setState((s) => ({ ...s, outbox: s.outbox.filter((n) => n.id !== id) })),
    setRewardPoints: (v) => setState((s) => ({ ...s, rewardPoints: Math.max(0, v) })),
    resetAll: () => {
      localStorage.removeItem(KEY);
      setState(buildSeed());
    },
    exportJSON: () => JSON.stringify(state, null, 2),
    importJSON: (json) => {
      try {
        const parsed = JSON.parse(json) as AdminState;
        if (!parsed.products || !parsed.orders) return false;
        setState({ ...buildSeed(), ...parsed });
        return true;
      } catch {
        return false;
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdmin innerhalb von AdminProvider verwenden');
  return ctx;
}

// Helfer für Dashboards/Tabellen
export const productByIdSafe = (id: string): Product | undefined =>
  seedProducts.find((p) => p.id === id);

export const statusColor: Record<OrderStatus, string> = {
  bestätigt: 'bg-royal-100 text-royal-700',
  versandt: 'bg-amber-100 text-amber-700',
  geliefert: 'bg-emerald-100 text-emerald-700',
  storniert: 'bg-red-100 text-red-600',
};
