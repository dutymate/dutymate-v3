import axiosInstance from '@/lib/axios';
import channelService from '@/services/channelService';
import { useEffect, useState } from 'react';
import { FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface Notice {
  noticeId: number;
  title: string;
  createdAt: string;
}

const Footer = () => {
  const navigate = useNavigate();
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);

  useEffect(() => {
    // Fetch the 4 most recent notices
    axiosInstance
      .get('/notice')
      .then((res) => {
        // Sort by creation date (newest first)
        const sortedNotices = res.data.sort(
          (a: Notice, b: Notice) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        // Take only the first 4
        setRecentNotices(sortedNotices.slice(0, 4));
      })
      .catch((error) => {
        console.error('Failed to fetch notices:', error);
      });
  }, []);

  const handleChatbotClick = () => {
    channelService.showMessenger();
  };

  const handleNoticeClick = () => {
    navigate('/notice');
  };

  const handleInquiryClick = () => {
    channelService.showMessenger();
  };

  return (
    <footer className="w-full bg-white py-6 sm:py-8 mt-4 sm:mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 공지사항 섹션 */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2">
              <h3
                className="text-base sm:text-lg font-bold text-gray-800 cursor-pointer"
                onClick={handleNoticeClick}
              >
                공지사항
              </h3>
            </div>
            <div className="space-y-1">
              {recentNotices.map((notice) => (
                <p
                  key={notice.noticeId}
                  className="text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-primary transition-colors truncate"
                  onClick={() => navigate(`/notice/${notice.noticeId}`)}
                >
                  • {notice.title}
                </p>
              ))}
              <p
                className="text-xs sm:text-sm text-gray-600 cursor-pointer hover:text-primary transition-colors"
                onClick={handleChatbotClick}
              >
                • 제휴 문의
              </p>
            </div>
          </div>

          {/* 소셜 미디어 섹션 */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">소셜 미디어</h3>
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/dutymate_net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaInstagram size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.youtube.com/@%EB%93%80%ED%8B%B0%EB%A9%94%EC%9D%B4%ED%8A%B8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaYoutube size={18} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://x.com/dutymate_net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <FaTwitter size={18} className="sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* 로고 및 사업자 정보 */}
        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            {/* 로고 */}
            <div className="flex-shrink-0">
              <img
                src="/images/text-logo.svg"
                alt="Dutymate"
                className="h-6 sm:h-8"
              />
            </div>

            {/* 사업자 정보 */}
            <address className="not-italic text-xs text-gray-500 space-y-2 flex-1">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <span>사업자등록번호: 623-50-01087</span>
                <span className="hidden sm:inline">|</span>
                <span>통신판매업신고번호: 준비중</span>
                <span className="hidden sm:inline">|</span>
                <span>대표자: 이재현</span>
                <span className="hidden sm:inline">|</span>
                <a
                  href="http://www.ftc.go.kr/bizCommPop.do?wrkr_no=6235001087"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors underline"
                >
                  사업자등록정보확인
                </a>
                <span className="hidden sm:inline">|</span>
                <span>
                  이메일:{' '}
                  <a
                    href="mailto:biz@dutymate.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-primary transition-colors underline"
                  >
                    biz@dutymate.net
                  </a>
                </span>
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <span>전화번호: 010-9697-4860</span>
                <span className="hidden sm:inline">|</span>
                <button
                  onClick={handleInquiryClick}
                  className="text-gray-500 hover:text-primary transition-colors underline cursor-pointer"
                >
                  <strong>1:1 문의하기</strong>
                </button>
                <span className="hidden sm:inline">|</span>
                <span>© 2025 BeProfound. All rights reserved.</span>
              </div>
            </address>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
