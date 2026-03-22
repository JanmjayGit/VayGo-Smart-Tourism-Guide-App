import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <AdminSidebar />
            {/* Main content — no Navbar, sidebar is the only navigation */}
            <main className="flex-1 ml-[240px] min-h-screen transition-all duration-300 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
