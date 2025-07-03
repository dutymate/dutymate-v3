import { FaCrown } from 'react-icons/fa';
import useMediaQuery from '@/hooks/useMediaQuery';
import DateSuggestionModal from './DateSuggestionModal';
import ShareDateModal from './ShareDateModal';
import { useState, useEffect } from 'react';
import { getGroupMeetingDate } from '@/services/groupService';
import { GroupMember, RecommendedDate } from '@/types/group';

interface CheckMemberModalProps {
  open: boolean;
  onClose: () => void;
  members: GroupMember[];
  selectedMembers: number[];
  setSelectedMembers: (ids: number[]) => void;
  groupId: number;
  highlightDates: (dates: string[]) => void;
  currentMonth: Date;
}

const CheckMemberModal: React.FC<CheckMemberModalProps> = ({
  open,
  onClose,
  members,
  selectedMembers,
  setSelectedMembers,
  groupId,
  highlightDates,
  currentMonth,
}) => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [dateSuggestionOpen, setDateSuggestionOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [recommendedDates, setRecommendedDates] = useState<RecommendedDate[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && members.length > 0) {
      setSelectedMembers(members.map((m) => m.memberId));
    }
  }, [open, members, setSelectedMembers]);

  if (!open) return null;

  const handleToggle = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleNext = async () => {
    // 선택된 멤버들의 memberId를 수집
    const selectedMemberIds = members
      .filter((member) => selectedMembers.includes(member.memberId))
      .map((member) => member.memberId);

    if (selectedMemberIds.length === 0) {
      // TODO: 선택된 멤버가 없을 때의 처리
      return;
    }

    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await getGroupMeetingDate(
        groupId,
        { groupMemberIds: selectedMemberIds },
        year,
        month
      );
      const getRecommendationText = (memberList: { duty: string }[]) => {
        // 모두 OFF면 BEST, 한 명이라도 D/E/M이면 OKAY, 그 외 HARD
        if (memberList.every((m) => m.duty === 'O')) return 'BEST';
        if (memberList.some((m) => ['D', 'E', 'M'].includes(m.duty)))
          return 'OKAY';
        return 'HARD';
      };
      setRecommendedDates(
        response.recommendedDateList.map((item: RecommendedDate) => ({
          ...item,
          lunch: getRecommendationText(item.memberList),
        }))
      );
      setDateSuggestionOpen(true);
    } catch (error) {
      console.error('Error getting meeting date suggestions:', error);
      // TODO: 에러 처리 (예: 에러 모달 표시)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/30">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className={`
          relative bg-white rounded-t-2xl lg:rounded-2xl shadow-xl w-full
          ${
            isMobile
              ? 'max-w-full pb-4 pt-2 px-4 animate-slideup'
              : 'max-w-sm p-5'
          }
          flex flex-col
          z-10
        `}
        style={isMobile ? { bottom: 0 } : {}}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="text-lg font-semibold mt-2 mb-1">인원 선택하기</div>
        <div className="text-sm text-gray-500 mb-4">
          약속을 잡을 멤버를 선택해주세요~!
        </div>
        <div className="flex flex-wrap gap-2 mb-7 max-[1023px]:justify-center">
          {members.map((m) => (
            <button
              key={m.memberId}
              className={`
                flex items-center px-4 py-1.5 rounded-xl border text-sm font-semibold transition
                ${
                  selectedMembers.includes(m.memberId)
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                    : 'bg-white border-gray-300 text-gray-500'
                }
              `}
              style={{ minWidth: 75 }}
              onClick={() => handleToggle(m.memberId)}
            >
              {m.isLeader && (
                <FaCrown className="mr-1 text-yellow-400 text-base" />
              )}
              {m.name}
            </button>
          ))}
        </div>
        <button
          className="w-full bg-primary text-white text-base font-semibold py-2 rounded-xl shadow mt-2 active:bg-primary-dark transition disabled:bg-gray-400"
          onClick={handleNext}
          disabled={isLoading || selectedMembers.length === 0}
        >
          {isLoading ? '로딩 중...' : '약속 날짜 추천받기'}
        </button>
        <DateSuggestionModal
          open={dateSuggestionOpen}
          onClose={() => {
            setDateSuggestionOpen(false);
            onClose();
          }}
          onShareClick={() => setShareOpen(true)}
          recommendedDates={recommendedDates}
          onHighlightDates={(dates) => {
            highlightDates(dates);
            setDateSuggestionOpen(false);
            onClose();
          }}
        />
        <ShareDateModal open={shareOpen} onClose={() => setShareOpen(false)} />
      </div>
    </div>
  );
};

export default CheckMemberModal;
