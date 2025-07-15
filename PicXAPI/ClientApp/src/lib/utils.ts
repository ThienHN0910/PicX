import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Order } from "./types";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatRelativeTime = (date: string): string => {
    const now = new Date();
    const sentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - sentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return sentDate.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

export const sortOrders = (
    orders: Order[],
    key: 'totalAmount' | 'orderDate' | null,
    direction: 'asc' | 'desc'
): Order[] => {
    if (!key) {
        return [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }
    return [...orders].sort((a, b) => {
        if (key === 'totalAmount') {
            const totalA = a.items.reduce((total, item) => total + item.totalPrice, 0);
            const totalB = b.items.reduce((total, item) => total + item.totalPrice, 0);
            return direction === 'asc' ? totalA - totalB : totalB - totalA;
        }
        if (key === 'orderDate') {
            return direction === 'asc'
                ? new Date(a.orderDate) - new Date(b.orderDate)
                : new Date(b.orderDate) - new Date(a.orderDate);
        }
        return 0;
    });
};
