"use client"
import Sidebar from "@/src/components/Sidebar/sidebar";
import { useProtectedRoute } from "@/src/hooks/useProtectedRoute";
import LoaderPage from "@/src/components/LoaderPage";

const AdminLayout = ({ children }: { children: React.ReactNode; }) => {

    const { loading } = useProtectedRoute();

    if (loading) {
        return <LoaderPage />
    }

    return (
        <div className="flex h-screen">
            {/* Sidebar Desktop */}
            <aside className="hidden md:block w-64 h-screen border-r shrink-0">
                <Sidebar />
            </aside>

            {/* Contenido */}
            <main className="min-w-0 flex-1 overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
            </main>

            {/* Navbar Mobile */}
            <aside className="fixed bottom-0 left-0 right-0 md:hidden z-50">
                <Sidebar />
            </aside>
        </div>
    )
}

export default AdminLayout;