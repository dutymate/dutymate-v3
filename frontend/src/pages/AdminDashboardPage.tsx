import AdminDashboard from '@/components/organisms/AdminDashboard';
import AdminSidebar from '@/components/organisms/AdminSidebar';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AdminSidebar />

      <div className="flex-1  ml-[240px]">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
