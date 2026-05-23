import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export default function AdminRoute() {
    const user = useAuthStore((s) => s.user)

    if (!user) {
        return <Navigate to="/auth/signin" replace />
    }

    if (user.role !== 'Admin') {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}
