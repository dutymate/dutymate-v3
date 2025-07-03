import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/atoms/Button';
import { Icon } from '@/components/atoms/Icon';

// GA4 타입 선언 (전역 Window 타입에 gtag 추가)
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

interface NurseShortageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onForceGenerate: () => Promise<void>;
  onAddTemporaryNurses: (count: number) => Promise<void>;
  executeAutoGenerate: () => void;
  neededNurseCount: number;
  currentNurseCount: number;
}

const NurseShortageModal: React.FC<NurseShortageModalProps> = ({
  isOpen,
  onClose,
  onForceGenerate,
  onAddTemporaryNurses,
  executeAutoGenerate,
  neededNurseCount,
  currentNurseCount,
}) => {
  const navigate = useNavigate();
  // additionalNursesNeeded 값을 내부 상태로 관리해서 props 변경에 영향받지 않도록 함
  const [internalNeededCount, setInternalNeededCount] = useState(0);
  const [tempNurseCount, setTempNurseCount] = useState(0);
  const [addedNurses, setAddedNurses] = useState(0);
  const [uiMode, setUiMode] = useState<'shortage' | 'complete'>('shortage');
  const [isAddingNurses, setIsAddingNurses] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 모달이 처음 열릴 때만 초기화하도록 플래그 사용
  const initializedRef = useRef(false);

  // 모바일 여부 확인
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    if (isOpen && !initializedRef.current) {
      const additionalNeeded = neededNurseCount - currentNurseCount;
      setInternalNeededCount(additionalNeeded);
      initializedRef.current = true;

      // 초기 UI 모드 설정
      setUiMode('shortage');
      setAddedNurses(0);
      setTempNurseCount(0);
    } else if (!isOpen) {
      // 모달이 닫히면 초기화 플래그 리셋
      initializedRef.current = false;
    }
  }, [isOpen, neededNurseCount, currentNurseCount]);

  // 선택한 간호사 수까지 포함했을 때 충분 여부
  const wouldBeSufficient = addedNurses + tempNurseCount >= internalNeededCount;

  // 현재 추가된 간호사가 필요 인원을 충족했는지 체크하고 UI 모드 업데이트
  useEffect(() => {
    if (isOpen && initializedRef.current) {
      const isSufficient = addedNurses >= internalNeededCount;
      setUiMode(isSufficient ? 'complete' : 'shortage');
    }
  }, [isOpen, addedNurses, internalNeededCount]);

  const handleAddNurse = () => {
    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'nurse_management',
        event_action: 'click',
        event_label: 'goto_ward_admin',
        event_id: `goto-ward-admin-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
      });

      // GA4 직접 이벤트 전송 (gtag 함수 사용)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'goto_ward_admin_click', {
          action_category: 'nurse_management',
          view_type: isMobile ? 'mobile' : 'desktop',
        });
      }
    }

    onClose();
    navigate('/ward-admin');
  };

  const handleAddTemporary = async () => {
    if (tempNurseCount <= 0 || isAddingNurses) return;

    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'nurse_management',
        event_action: 'click',
        event_label: 'add_temp_nurse',
        event_id: `add-temp-nurse-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
        nurse_count: tempNurseCount,
      });

      // GA4 직접 이벤트 전송 (gtag 함수 사용)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'add_temp_nurse_click', {
          action_category: 'nurse_management',
          view_type: isMobile ? 'mobile' : 'desktop',
          nurse_count: tempNurseCount,
        });
      }
    }

    // 로딩 상태 설정
    setIsAddingNurses(true);

    try {
      // API 호출 및 응답 대기
      await onAddTemporaryNurses(tempNurseCount);

      // API 응답 성공 후 상태 업데이트
      const newTotal = addedNurses + tempNurseCount;
      setAddedNurses(newTotal);
      setTempNurseCount(0);

      // API 응답 성공 후 정확한 계산으로 UI 모드 결정
      // 내부 상태 기준으로 판단
      if (newTotal >= internalNeededCount) {
        setUiMode('complete');
      } else {
        // 아직 부족한 경우 확실히 shortage 모드 유지
        setUiMode('shortage');
      }
    } catch (error) {
      console.error('임시 간호사 추가 실패:', error);
      // 에러 발생 시 UI 모드는 변경하지 않음
    } finally {
      // 로딩 상태 해제
      setIsAddingNurses(false);
    }
  };

  const handleAutoGenerate = () => {
    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'auto_generate',
        event_action: 'click',
        event_label: 'start_auto_generate',
        event_id: `start-auto-generate-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
      });

      // GA4 직접 이벤트 전송 (gtag 함수 사용)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'start_auto_generate_click', {
          action_category: 'auto_generate',
          view_type: isMobile ? 'mobile' : 'desktop',
        });
      }
    }

    executeAutoGenerate();
    onClose();
  };

  const handleForceGenerate = async () => {
    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'auto_generate',
        event_action: 'click',
        event_label: 'force_generate',
        event_id: `force-generate-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
      });

      // GA4 직접 이벤트 전송 (gtag 함수 사용)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'force_generate_click', {
          action_category: 'auto_generate',
          view_type: isMobile ? 'mobile' : 'desktop',
        });
      }
    }

    await onForceGenerate();
  };

  const handleDecreaseTempNurse = () => {
    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'nurse_management',
        event_action: 'click',
        event_label: 'decrease_temp_nurse',
        event_id: `decrease-temp-nurse-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
        current_count: tempNurseCount,
      });
    }

    setTempNurseCount(Math.max(0, tempNurseCount - 1));
  };

  const handleIncreaseTempNurse = () => {
    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'nurse_management',
        event_action: 'click',
        event_label: 'increase_temp_nurse',
        event_id: `increase-temp-nurse-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
        current_count: tempNurseCount,
      });
    }

    setTempNurseCount(Math.min(remainingNeeded, tempNurseCount + 1));
  };

  const handleCloseModal = () => {
    // GTM 이벤트 트래킹
    if (typeof window !== 'undefined' && 'dataLayer' in window) {
      window.dataLayer.push({
        event: 'button_click',
        event_category: 'modal',
        event_action: 'close',
        event_label: 'nurse_shortage_modal',
        event_id: `close-modal-button`,
        view_type: isMobile ? 'mobile' : 'desktop',
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  const isShortageMode = uiMode === 'shortage';
  const remainingNeeded = internalNeededCount - addedNurses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-[22.5rem]">
        <div className="flex rounded-t-xl justify-between bg-primary-bg items-center px-4 py-2 border-b">
          <h2 className="text-sm font-medium text-primary-dark">
            {isShortageMode ? '간호사 인원이 부족해요' : '자동생성 준비 완료!'}
          </h2>
          <button
            onClick={handleCloseModal}
            className="text-primary hover:text-primary/80"
            id="close-modal-button"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="p-4">
          {isShortageMode && (
            <div className="text-sm text-gray-600 mb-6">
              <p className="mb-2">
                현재 모든 인원의 <span className="font-bold">법정 공휴일</span>
                을 보장할 수 없습니다.
              </p>
              <p>
                근무를 위해 최소{' '}
                <span className="font-bold text-primary">
                  {internalNeededCount}명
                </span>
                의 간호사가 더 필요합니다.
              </p>
              {addedNurses > 0 && (
                <p className="mt-2 font-medium text-duty-day-dark">
                  * 임시 간호사 {addedNurses}명 추가됨
                  {addedNurses >= internalNeededCount
                    ? ' (충분)'
                    : ` (${internalNeededCount - addedNurses}명 부족)`}
                </p>
              )}
            </div>
          )}

          {isShortageMode ? (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium mb-3">임시 간호사 추가</h3>
              <div className="flex items-center justify-center gap-4 mb-2">
                <button
                  onClick={handleDecreaseTempNurse}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg font-medium"
                  disabled={isAddingNurses}
                  id="decrease-temp-nurse-button"
                >
                  -
                </button>
                <span className="text-xl font-medium w-12 text-center">
                  {tempNurseCount}
                </span>
                <button
                  onClick={handleIncreaseTempNurse}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg font-medium"
                  disabled={tempNurseCount >= remainingNeeded || isAddingNurses}
                  id="increase-temp-nurse-button"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {wouldBeSufficient ? (
                  <span className="text-duty-day-dark">
                    필요한 인원이 충족되었어요
                  </span>
                ) : (
                  <span className="text-duty-evening-dark">
                    아직 {internalNeededCount - tempNurseCount - addedNurses}
                    명이 부족해요
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="bg-primary-bg/20 rounded-lg p-4 mb-6 text-center">
              <div className="flex items-center justify-center">
                <div className="bg-primary-bg/40 p-2 rounded-full mb-2">
                  <Icon name="heartFilled" size={24} className="text-primary" />
                </div>
              </div>
              <p className="text-sm font-medium text-duty-day-dark">
                필요한 인원이 모두 충족되었습니다!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                자동생성을 시작하거나 병동 관리로 이동할 수 있습니다.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {isShortageMode ? (
              <Button
                size="sm"
                color="primary"
                onClick={handleAddTemporary}
                disabled={tempNurseCount <= 0 || isAddingNurses}
                className="!w-full"
                id="add-temp-nurse-button"
              >
                {isAddingNurses
                  ? '추가 중...'
                  : `임시 간호사 ${tempNurseCount}명 추가하기`}
              </Button>
            ) : (
              <Button
                size="sm"
                color="primary"
                onClick={handleAutoGenerate}
                className="!w-full"
                id="start-auto-generate-button"
              >
                생성하기
              </Button>
            )}
            <div className="flex justify-between gap-2">
              <Button
                size="sm"
                color="off"
                onClick={handleAddNurse}
                className={!isShortageMode ? '!w-full' : 'flex-1'}
                disabled={isAddingNurses}
                id="goto-ward-admin-button"
              >
                병동 관리로 이동
              </Button>
              {isShortageMode && (
                <Button
                  size="sm"
                  color="evening"
                  onClick={handleForceGenerate}
                  className="flex-1"
                  disabled={isAddingNurses}
                  id="force-generate-button"
                >
                  그대로 생성하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseShortageModal;
