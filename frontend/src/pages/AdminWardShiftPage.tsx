import AdminSidebar from '@/components/organisms/AdminSidebar';
import AdminWardShift from '@/components/organisms/AdminWardShift';

const AdminWardShiftPage = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AdminSidebar />

      <div className="flex-1  ml-[240px]">
        <AdminWardShift />
      </div>
    </div>
  );
};

export default AdminWardShiftPage;
