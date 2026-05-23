import './StarRating.css'

interface StarRatingProps {
    rating: number        // 0-10 scale từ backend
    maxStars?: number
    size?: 'sm' | 'md' | 'lg'
    showValue?: boolean
    interactive?: boolean
    onRate?: (rating: number) => void
}

export default function StarRating({
    rating,
    maxStars = 5,
    size = 'md',
    showValue = true,
    interactive = false,
    onRate,
}: StarRatingProps) {
    // Backend dùng thang 0-10, hiển thị thang 0-5
    const displayRating = rating / 2

    const handleClick = (index: number) => {
        if (!interactive || !onRate) return
        // Gửi về backend theo thang 0-10
        onRate((index + 1) * 2)
    }

    return (
        <div className={`star-rating star-rating--${size}`}>
            <div className="star-rating__stars">
                {Array.from({ length: maxStars }).map((_, i) => {
                    const filled = i < Math.floor(displayRating)
                    const partial = !filled && i < displayRating

                    return (
                        <span
                            key={i}
                            className={`star ${filled ? 'star--filled' : partial ? 'star--partial' : 'star--empty'} ${interactive ? 'star--interactive' : ''}`}
                            onClick={() => handleClick(i)}
                            aria-hidden="true"
                        >
                            ★
                        </span>
                    )
                })}
            </div>
            {showValue && (
                <span className="star-rating__value">
                    {displayRating.toFixed(1)}
                </span>
            )}
        </div>
    )
}
