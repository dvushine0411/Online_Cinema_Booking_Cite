// Format ngày: 2026-05-13T10:00:00 -> "13/05/2026" //

export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);

    return date.toLocaleDateString("vi-VN",
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
};

// Format giờ: 2026-05-13T10:00:00 -> "10:00" //

export const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);

    return date.toLocaleTimeString("vi-VN", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

// Format ngày + giờ: 2026-05-13T10:00:00 -> "13/05/2026 10:00" //

export const formatDateTime = (dateStr: string): string => {
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

// Format tiền tệ: 100000 -> "100.000đ" //

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Format thời lượng phim: 125 -> "2 giờ 5 phút" //

export const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) return `${m} phút`;
    if (m === 0) return `${h} giờ`;
    return `${h} giờ ${m} phút`;
};

// Tạo label ghế //

export const formatSeatLabel = (row: string, number: number): string => {
    return `${row}${number}`;

};

// Kiểm tra ghế đã được đặt chưa //

export const isSeatBooked = (row: string, number: number, bookedSeats: string[]): boolean => {
    return bookedSeats.includes(formatSeatLabel(row, number));
};

export const caclAverageRating = (ratings: number[]): number => {
    if (ratings.length === 0) return 0;

    const sum = ratings.reduce((acc, curr) => acc + curr, 0);
    return Math.round((sum / ratings.length) * 10) / 10;
};


// Rút gọn nội dung text dài //
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength).trimEnd() + "...";

}

// Kiểm tra token JWT còn hạn hay không //

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();

    } catch {
        return true;
    }
};

// atob: chuyển đổi base64 thành json //
//  JWT: Header . Payload . Signature //
// JSON.parse() -> dùng để chuyển json thành object javascript để truy cập các thuộc tính như exp //






