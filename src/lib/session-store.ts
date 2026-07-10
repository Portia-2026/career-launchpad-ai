import { create } from "zustand";

export type ActivityItem = {
  id: string;
  type: "email" | "plan" | "chat";
  title: string;
  timestamp: number;
};

type SessionState = {
  emailsGenerated: number;
  plansCreated: number;
  chatsSent: number;
  activity: ActivityItem[];
  logActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;
  reset: () => void;
};

export const useSession = create<SessionState>((set) => ({
  emailsGenerated: 0,
  plansCreated: 0,
  chatsSent: 0,
  activity: [],
  logActivity: (item) =>
    set((s) => {
      const entry: ActivityItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      return {
        activity: [entry, ...s.activity].slice(0, 10),
        emailsGenerated: s.emailsGenerated + (item.type === "email" ? 1 : 0),
        plansCreated: s.plansCreated + (item.type === "plan" ? 1 : 0),
        chatsSent: s.chatsSent + (item.type === "chat" ? 1 : 0),
      };
    }),
  reset: () =>
    set({ emailsGenerated: 0, plansCreated: 0, chatsSent: 0, activity: [] }),
}));
