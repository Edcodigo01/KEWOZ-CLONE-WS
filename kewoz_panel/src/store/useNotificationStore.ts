import { notificationService } from "@/services/global/notificationService";
import { create } from "zustand";
import type { NewUser, Pagination } from "@/services/global/notificationService";

interface NotificationState {
    isAvailable: boolean;
    loading: boolean;
    error: string | null;

    notifications: NewUser[];
    pagination: Pagination | null;
    loadingMore: boolean;

    fetchAvailability: () => Promise<void>;
    setAvailable: (value: boolean) => void;

    fetchNotifications: (page?: number, limit?: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    isAvailable: false,
    loading: false,
    error: null,

    notifications: [],
    pagination: null,
    loadingMore: false,

    fetchAvailability: async () => {
        set({ loading: true, error: null });
        try {
            const res = await notificationService.isNotificationAvailable();
            set({ isAvailable: res.data.is_available, loading: false });
        } catch (err: any) {
            set({ error: err.message ?? "Failed to fetch", loading: false });
        }
    },

    setAvailable: (value: boolean) => set({ isAvailable: value }),

    fetchNotifications: async (page = 1, limit = 10) => {
        const { notifications } = get();
        set({ loadingMore: true });
        try {
            const res = await notificationService.notificationList({ page, limit });
            set({
                notifications:
                    page === 1
                        ? res.data.newUsers
                        : [...notifications, ...res.data.newUsers],
                pagination: res.data.Pagination,
                loadingMore: false,
            });
        } catch (err: any) {
            set({ error: err.message ?? "Failed to load notifications", loadingMore: false });
        }
    },
}));
