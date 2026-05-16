export const SEAT_TYPES = {
    STANDARD: 'Standard',
    VIP: 'VIP',
    SWEETBOX: 'Sweetbox',
} as const;

export const BOOKING_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
} as const;

export const BOOKING_STATUS_COLOR: Record<string, string> = {
    Pending: '#f59e0b',
    Confirmed: '#22c55e',
    Cancelled: '#ef4444',
    Refunded: '#6366f1',
}

export const MOVIE_STATUS = {
    NOW_SHOWING: 'Now showing',
    COMING_SOON: 'Coming soon',
} as const;

export const NEWS_CATEGORIES = [
    'Khuyến mãi',
    'Phim mới',
    'Thông báo',
    'Sự kiện',
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];

export const MAX_SEAT_SELECTION = 15;

export const DEFAULT_PAGE_SIZE = 10;