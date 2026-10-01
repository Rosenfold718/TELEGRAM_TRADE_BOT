"use client";

import { create } from "zustand";

interface AppState {
  workerRunning: boolean;
  setWorkerRunning: (v: boolean) => void;

  settingsOpen: boolean;
  setSettingsOpen: (v: boolean) => void;

  tradesFilter: "ALL" | "OPEN" | "CLOSED";
  setTradesFilter: (v: "ALL" | "OPEN" | "CLOSED") => void;

  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  workerRunning: false,
  setWorkerRunning: (v) => set({ workerRunning: v }),

  settingsOpen: false,
  setSettingsOpen: (v) => set({ settingsOpen: v }),

  tradesFilter: "ALL",
  setTradesFilter: (v) => set({ tradesFilter: v }),

  autoRefresh: true,
  setAutoRefresh: (v) => set({ autoRefresh: v }),
}));
