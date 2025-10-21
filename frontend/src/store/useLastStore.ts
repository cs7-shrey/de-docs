import { create } from "zustand";

interface LastStore {
    lastOperationalStart: number;
    lastOperationalOffset: number;
    setLastOperationalStart: (start: number) => void;
    setLastOperationalOffset: (offset: number) => void;
}

export const useLastStore = create<LastStore>((set) => ({
    lastOperationalStart: 0,
    lastOperationalOffset: 0,
    setLastOperationalStart: (start) => set({ lastOperationalStart: start }),
    setLastOperationalOffset: (offset) => set({ lastOperationalOffset: offset }),
}));