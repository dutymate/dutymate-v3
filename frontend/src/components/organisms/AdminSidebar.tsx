//관리자 페이지 사이드바

import { Link, useLocation } from 'react-router-dom';

// import Profile from '@/components/atoms/Profile';
import { FaHome, FaHospital, FaRegUser } from 'react-icons/fa';

const adminNavigation = [
  { name: '관리자 메인', href: '/admin/dashboard', icon: FaHome },
  { name: '병동 관리', href: '/admin/wards?page=1', icon: FaHospital },
  { name: '간호사 관리', href: '/admin/nurses', icon: FaRegUser },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed top-0 left-0 h-screen min-h-screen w-[240px] bg-[#1B1B1B] text-white flex flex-col py-8 px-4">
      {/* 로고 */}
      <div className="flex flex-row items-center justify-center gap-4 mb-12">
        <img src="/logo.svg" alt="듀티메이트" className="w-7 h-7" />
        <span className="text-[1.5rem] font-bold">ADMIN</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex flex-col gap-2">
        {adminNavigation.map((item) => {
          const baseHref = item.href.split('?')[0];
          const active = location.pathname.startsWith(baseHref);

          // ✔ 병동 관리만 강제로 새로고침
          if (item.name === '병동 관리') {
            return (
              <button
                key={item.name}
                onClick={() => {
                  window.location.href = '/admin/wards?page=1';
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg 
                  text-sm font-medium w-full text-left
                  ${active ? 'bg-white text-black' : 'text-white/80 hover:bg-gray-700'}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg 
                text-sm font-medium
                ${active ? 'bg-white text-black' : 'hover:bg-gray-700'}
              `}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
