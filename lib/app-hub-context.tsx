"use client";

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  applications,
  calendarEvents,
  type Application,
  type AppStatus,
  type CalendarEvent,
  type SubApp,
} from "@/lib/app-data";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

export interface CategoryInfo {
  label: string;
  hex: string;
}

export interface AppHubState {
  /** Raw custom apps (includes soft-deleted with `deleted: true`) */
  customApps: Application[];
  /** Status overrides keyed by app id */
  appStatusOverrides: Record<string, AppStatus>;
  /** Sub-app status overrides keyed by `${appId}:${subId}` */
  subAppStatusOverrides: Record<string, AppStatus>;
  /** Raw custom calendar events (includes soft-deleted) */
  customCalendarEvents: CalendarEvent[];
  /** Pinned app IDs */
  pinnedIds: Set<string>;
  /** Category color overrides for built-in categories */
  categoryColorOverrides: Record<string, string>;
  /** Category name overrides for built-in categories */
  categoryNameOverrides: Record<string, string>;
  /** Custom event categories */
  customCategories: { key: string; label: string; hex: string }[];
}

export interface AppHubContextValue extends AppHubState {
  /** All apps — base + custom, minus deleted, with status overrides applied */
  allApps: Application[];
  /** All calendar events — base + custom, minus deleted */
  allCalendarEvents: CalendarEvent[];
  /** Merged category map (built-in overrides + custom) */
  allCategories: Record<string, CategoryInfo>;

  // ── App mutations ──
  addApp: (app: Application) => void;
  updateApp: (id: string, updates: Partial<Application>) => void;
  removeApp: (id: string) => void;
  updateAppStatus: (id: string, status: AppStatus) => void;
  updateSubAppStatus: (appId: string, subId: string, status: AppStatus) => void;
  addSubApp: (appId: string, subApp: SubApp) => void;
  updateSubApp: (appId: string, subId: string, updates: Partial<SubApp>) => void;
  removeSubApp: (appId: string, subId: string) => void;
  togglePin: (id: string) => void;

  // ── Calendar mutations ──
  addCalendarEvent: (ev: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  removeCalendarEvent: (id: string) => void;

  // ── Category mutations ──
  updateCategoryColor: (key: string, hex: string) => void;
  updateCategoryName: (key: string, name: string) => void;
  resetCategoryOverrides: (key: string) => void;
  addCustomCategory: (key: string, label: string, hex: string) => void;
  removeCustomCategory: (key: string) => void;
  updateCustomCategoryColor: (key: string, hex: string) => void;
}

/* ═══════════════════════════════════════════════════════════════
   Default state
   ═══════════════════════════════════════════════════════════════ */

const DEFAULT_STATE: AppHubState = {
  customApps: [],
  appStatusOverrides: {},
  subAppStatusOverrides: {},
  customCalendarEvents: [],
  pinnedIds: new Set(["eoffice", "academic"]),
  categoryColorOverrides: {},
  categoryNameOverrides: {},
  customCategories: [],
};

/* ═══════════════════════════════════════════════════════════════
   Built-in category map (base defaults)
   ═══════════════════════════════════════════════════════════════ */

const BUILT_IN_CATEGORIES: Record<string, CategoryInfo> = {
  meeting: { label: "ประชุม", hex: "#a855f7" },
  seminar: { label: "สัมมนา", hex: "#3b82f6" },
  exam: { label: "สอบ", hex: "#f97316" },
  holiday: { label: "วันหยุด", hex: "#ef4444" },
  deadline: { label: "กำหนดส่ง", hex: "#ec4899" },
};

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

type AppWithDeleted = Application & { deleted?: boolean };
type CalWithDeleted = CalendarEvent & { deleted?: boolean };

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored) as T;
  } catch { /* ignore */ }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════════════════════
   Context
   ═══════════════════════════════════════════════════════════════ */

const AppHubContext = createContext<AppHubContextValue | null>(null);

export function AppHubProvider({ children }: { children: ReactNode }) {
  // ── Hydrate from localStorage on mount (safe — happens only client-side) ──
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<AppHubState>(DEFAULT_STATE);

  useEffect(() => {
    setState({
      customApps: loadFromStorage<Application[]>("app-hub-custom-apps", []),
      appStatusOverrides: loadFromStorage<Record<string, AppStatus>>("app-hub-status-overrides", {}),
      subAppStatusOverrides: loadFromStorage<Record<string, AppStatus>>("app-hub-sub-status-overrides", {}),
      customCalendarEvents: loadFromStorage<CalendarEvent[]>("app-hub-custom-events", []),
      pinnedIds: loadFromStorage<string[]>("app-hub-pins", ["eoffice", "academic"]).reduce(
        (s, id) => s.add(id), new Set<string>()
      ),
      categoryColorOverrides: loadFromStorage<Record<string, string>>("app-hub-cat-colors", {}),
      categoryNameOverrides: loadFromStorage<Record<string, string>>("app-hub-cat-names", {}),
      customCategories: loadFromStorage<{ key: string; label: string; hex: string }[]>("app-hub-custom-cats", []),
    });
    setHydrated(true);
  }, []);

  // ── Persist to localStorage on every change (after hydration) ──
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage("app-hub-custom-apps", state.customApps);
    saveToStorage("app-hub-status-overrides", state.appStatusOverrides);
    saveToStorage("app-hub-sub-status-overrides", state.subAppStatusOverrides);
    saveToStorage("app-hub-custom-events", state.customCalendarEvents);
    saveToStorage("app-hub-pins", [...state.pinnedIds]);
    saveToStorage("app-hub-cat-colors", state.categoryColorOverrides);
    saveToStorage("app-hub-cat-names", state.categoryNameOverrides);
    saveToStorage("app-hub-custom-cats", state.customCategories);
  }, [hydrated, state]);

  // ── Derived data ──
  const allApps = useMemo(() => {
    const deletedIds = new Set(
      state.customApps.filter((a) => (a as AppWithDeleted).deleted).map((a) => a.id)
    );
    const merged = [
      ...applications.filter((a) => !deletedIds.has(a.id)),
      ...state.customApps.filter((a) => !(a as AppWithDeleted).deleted),
    ];
    return merged.map((a) => ({
      ...a,
      status: state.appStatusOverrides[a.id] ?? a.status,
      subApps: a.subApps.map((s) => ({
        ...s,
        status: state.subAppStatusOverrides[`${a.id}:${s.id}`] ?? s.status,
      })),
    }));
  }, [state.customApps, state.appStatusOverrides, state.subAppStatusOverrides]);

  const allCalendarEvents = useMemo(() => {
    const deletedIds = new Set(
      state.customCalendarEvents.filter((e) => (e as CalWithDeleted).deleted).map((e) => e.id)
    );
    const overridden = new Set(
      state.customCalendarEvents.filter((e) => !(e as CalWithDeleted).deleted).map((e) => e.id)
    );
    const base = calendarEvents.filter(
      (e) => !deletedIds.has(e.id) && !overridden.has(e.id)
    );
    const custom = state.customCalendarEvents.filter(
      (e) => !(e as CalWithDeleted).deleted
    );
    return [...base, ...custom];
  }, [state.customCalendarEvents]);

  const allCategories = useMemo(() => {
    const merged: Record<string, CategoryInfo> = {};
    for (const [key, cat] of Object.entries(BUILT_IN_CATEGORIES)) {
      merged[key] = {
        label: state.categoryNameOverrides[key] ?? cat.label,
        hex: state.categoryColorOverrides[key] ?? cat.hex,
      };
    }
    for (const c of state.customCategories) {
      merged[c.key] = { label: c.label, hex: c.hex };
    }
    return merged;
  }, [state.categoryColorOverrides, state.categoryNameOverrides, state.customCategories]);

  // ── Wrapped setState helper ──
  const update = useCallback((fn: (prev: AppHubState) => AppHubState) => {
    setState((prev) => fn(prev));
  }, []);

  // ── App mutations ──
  const addApp = useCallback((app: Application) => {
    update((prev) => ({ ...prev, customApps: [...prev.customApps, app] }));
  }, [update]);

  const updateApp = useCallback((id: string, updates: Partial<Application>) => {
    update((prev) => ({
      ...prev,
      customApps: prev.customApps.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  }, [update]);

  const removeApp = useCallback((id: string) => {
    update((prev) => {
      const existing = prev.customApps.find((a) => a.id === id);
      if (existing) {
        return { ...prev, customApps: prev.customApps.filter((a) => a.id !== id) };
      }
      // Soft-delete base app
      return {
        ...prev,
        customApps: [
          ...prev.customApps,
          { id, deleted: true, status: "online" } as Application & { deleted?: boolean },
        ],
      };
    });
  }, [update]);

  const updateAppStatus = useCallback((id: string, status: AppStatus) => {
    update((prev) => ({
      ...prev,
      appStatusOverrides: { ...prev.appStatusOverrides, [id]: status },
    }));
  }, [update]);

  const updateSubAppStatus = useCallback((appId: string, subId: string, status: AppStatus) => {
    update((prev) => ({
      ...prev,
      subAppStatusOverrides: { ...prev.subAppStatusOverrides, [`${appId}:${subId}`]: status },
    }));
  }, [update]);

  // ── Sub-app mutations ──
  /** ตรวจสอบว่ามี app นี้ใน customApps แล้วหรือยัง — ถ้ายังให้ copy จาก base มา */
  function ensureCustomApp(prev: AppHubState, appId: string, allApps: Application[]): AppHubState {
    if (prev.customApps.some((a) => a.id === appId)) return prev;
    const base = allApps.find((a) => a.id === appId);
    if (!base) return prev;
    return {
      ...prev,
      customApps: [...prev.customApps, { ...base, subApps: base.subApps.map((s) => ({ ...s })) }],
    };
  }

  const addSubApp = useCallback((appId: string, subApp: SubApp) => {
    update((prev) => {
      const ready = ensureCustomApp(prev, appId, applications as Application[]);
      return {
        ...ready,
        customApps: ready.customApps.map((a) =>
          a.id === appId ? { ...a, subApps: [...a.subApps, subApp] } : a
        ),
      };
    });
  }, [update]);

  const updateSubApp = useCallback((appId: string, subId: string, updates: Partial<SubApp>) => {
    update((prev) => {
      const ready = ensureCustomApp(prev, appId, applications as Application[]);
      return {
        ...ready,
        customApps: ready.customApps.map((a) =>
          a.id === appId
            ? { ...a, subApps: a.subApps.map((s) => (s.id === subId ? { ...s, ...updates } : s)) }
            : a
        ),
      };
    });
  }, [update]);

  const removeSubApp = useCallback((appId: string, subId: string) => {
    update((prev) => {
      const ready = ensureCustomApp(prev, appId, applications as Application[]);
      return {
        ...ready,
        customApps: ready.customApps.map((a) =>
          a.id === appId ? { ...a, subApps: a.subApps.filter((s) => s.id !== subId) } : a
        ),
      };
    });
  }, [update]);

  const togglePin = useCallback((id: string) => {
    update((prev) => {
      const next = new Set(prev.pinnedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, pinnedIds: next };
    });
  }, [update]);

  // ── Calendar mutations ──
  const addCalendarEvent = useCallback((ev: CalendarEvent) => {
    update((prev) => ({
      ...prev,
      customCalendarEvents: [...prev.customCalendarEvents, ev],
    }));
  }, [update]);

  const updateCalendarEvent = useCallback(
    (id: string, updates: Partial<CalendarEvent>) => {
      update((prev) => {
        const existing = prev.customCalendarEvents.find((e) => e.id === id);
        if (existing) {
          return {
            ...prev,
            customCalendarEvents: prev.customCalendarEvents.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          };
        }
        // Copy from base
        const fromBase = calendarEvents.find((e) => e.id === id);
        if (fromBase) {
          return {
            ...prev,
            customCalendarEvents: [
              ...prev.customCalendarEvents,
              { ...fromBase, ...updates },
            ],
          };
        }
        return prev;
      });
    },
    [update]
  );

  const removeCalendarEvent = useCallback((id: string) => {
    update((prev) => {
      const existing = prev.customCalendarEvents.find((e) => e.id === id);
      if (existing) {
        return {
          ...prev,
          customCalendarEvents: prev.customCalendarEvents.filter((e) => e.id !== id),
        };
      }
      // Soft-delete base event
      return {
        ...prev,
        customCalendarEvents: [
          ...prev.customCalendarEvents,
          { id, deleted: true } as CalendarEvent & { deleted?: boolean },
        ],
      };
    });
  }, [update]);

  // ── Category mutations ──
  const updateCategoryColor = useCallback((key: string, hex: string) => {
    update((prev) => ({
      ...prev,
      categoryColorOverrides: { ...prev.categoryColorOverrides, [key]: hex },
    }));
  }, [update]);

  const updateCategoryName = useCallback((key: string, name: string) => {
    update((prev) => ({
      ...prev,
      categoryNameOverrides: { ...prev.categoryNameOverrides, [key]: name },
    }));
  }, [update]);

  const resetCategoryOverrides = useCallback((key: string) => {
    update((prev) => {
      const colors = { ...prev.categoryColorOverrides };
      delete colors[key];
      const names = { ...prev.categoryNameOverrides };
      delete names[key];
      return { ...prev, categoryColorOverrides: colors, categoryNameOverrides: names };
    });
  }, [update]);

  const addCustomCategory = useCallback(
    (key: string, label: string, hex: string) => {
      update((prev) => ({
        ...prev,
        customCategories: [...prev.customCategories, { key, label, hex }],
      }));
    },
    [update]
  );

  const removeCustomCategory = useCallback((key: string) => {
    update((prev) => ({
      ...prev,
      customCategories: prev.customCategories.filter((c) => c.key !== key),
    }));
  }, [update]);

  const updateCustomCategoryColor = useCallback((key: string, hex: string) => {
    update((prev) => ({
      ...prev,
      customCategories: prev.customCategories.map((c) =>
        c.key === key ? { ...c, hex } : c
      ),
    }));
  }, [update]);

  const value: AppHubContextValue = useMemo(
    () => ({
      ...state,
      allApps,
      allCalendarEvents,
      allCategories,
      addApp,
      updateApp,
      removeApp,
      updateAppStatus,
      updateSubAppStatus,
      addSubApp,
      updateSubApp,
      removeSubApp,
      togglePin,
      addCalendarEvent,
      updateCalendarEvent,
      removeCalendarEvent,
      updateCategoryColor,
      updateCategoryName,
      resetCategoryOverrides,
      addCustomCategory,
      removeCustomCategory,
      updateCustomCategoryColor,
    }),
    [
      state,
      allApps,
      allCalendarEvents,
      allCategories,
      addApp,
      updateApp,
      removeApp,
      updateAppStatus,
      updateSubAppStatus,
      addSubApp,
      updateSubApp,
      removeSubApp,
      togglePin,
      addCalendarEvent,
      updateCalendarEvent,
      removeCalendarEvent,
      updateCategoryColor,
      updateCategoryName,
      resetCategoryOverrides,
      addCustomCategory,
      removeCustomCategory,
      updateCustomCategoryColor,
    ]
  );

  return (
    <AppHubContext.Provider value={value}>{children}</AppHubContext.Provider>
  );
}

export function useAppHub() {
  const ctx = useContext(AppHubContext);
  if (!ctx) throw new Error("useAppHub must be used within <AppHubProvider>");
  return ctx;
}
