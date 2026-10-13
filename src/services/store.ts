import { useSyncExternalStore } from "react";
import type { AppState } from "@/types";
import { seedState } from "@/data/mock";

/**
 * Local state container backed by localStorage.
 * Swap this module (and services/pos.ts) for a backend-backed implementation later;
 * UI only depends on `useAppState` and the actions in services/pos.ts.
 */
const KEY = "pooja-pos-v1";
const initial = seedState();
let state: AppState = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function hydrateStore() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      state = { ...initial, ...saved, settings: { ...initial.settings, ...saved.settings } };
    }
  } catch {
    /* ignore corrupt storage */
  }
  emit();
}

export function isHydrated() {
  return hydrated;
}

export function getState() {
  return state;
}

export function setState(fn: (s: AppState) => AppState) {
  state = fn(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
  emit();
}

export function resetStore() {
  state = { ...seedState(), sessionUserId: state.sessionUserId };
  setState((s) => s);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => initial);
}

export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => hydrated, () => false);
}
