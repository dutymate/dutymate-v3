//관리자 페이지
import AdminSidebar from '@/components/organisms/AdminSidebar';
import AdminWardList from '@/components/organisms/AdminWardList';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AdminWardPage = () => {
  const location = useLocation();

  const getPageFromUrl = () => {
    const params = new URLSearchParams(location.search);
    const rawPage = Number(params.get('page') || '1');

    return Number(rawPage ?? '1');
  };

  const [currentPage, setCurrentPage] = useState(getPageFromUrl() - 1);

  useEffect(() => {
    const newPage = getPageFromUrl() - 1;
    setCurrentPage(newPage);
  }, [location.search]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex">
      <AdminSidebar />

      <div className="flex-1  ml-[240px]">
        <AdminWardList initialPage={currentPage} />
      </div>
    </div>
  );
};

export default AdminWardPage;
