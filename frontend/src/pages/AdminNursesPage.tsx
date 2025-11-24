import AdminSidebar from '@/components/organisms/AdminSidebar';

const AdminNursesPage = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AdminSidebar />

      <div className="flex-1  ml-[240px] flex items-center justify-center">
        <div className="text-base">간호사 관리 페이지 입니다.</div>
      </div>
    </div>
  );
};

export default AdminNursesPage;
