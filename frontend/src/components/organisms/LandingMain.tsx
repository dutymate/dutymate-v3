import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    src: '/images/landing/ShiftRequestsAdmin_1.png',
    title: '요청 근무 관리',
    desc: <>다양한 요청을 똑똑하게 관리</>,
    sub: (
      <>
        듀티메이트로 효율적인 요청 관리와 <br className="block md:hidden" />
        승인 과정을 간소화하세요.
      </>
    ),
    align: 'left',
    size: 'w-[15rem] md:w-[18rem] lg:w-[20rem]', // 📌 이미지 1번 크기
  },
  {
    src: '/images/landing/ShiftRequest_2.png',
    title: '요청 관리',
    desc: (
      <>
        카톡, 전화 복잡한 요청
        <br className="block md:hidden" />
        이제 그만.
      </>
    ),
    sub: '듀티메이트로 한 번에 신청 및 현황까지 한눈에.',
    align: 'right',
    size: 'w-[13rem] md:w-[16rem] lg:w-[18rem]', // 📌 이미지 2번 크기
  },
  {
    src: '/images/landing/ShiftScheduleCreation_3.png',
    title: '자동 생성',
    desc: '골치 아픈 근무표 생성 클릭 한 번에',
    sub: '병동 규칙과 근무 유형까지 반영되는 자동 생성 기능.',
    align: 'left',
    size: 'w-[22rem] md:w-[26rem] lg:w-[30rem]', // 📌 이미지 3번 크기
  },
  {
    src: '/images/landing/WardCustomization_4.png',
    title: '규칙 설정',
    desc: <>병동에 맞게 커스텀</>,
    sub: '병동별 환경과 인원에 맞춰 설정이 가능합니다.',
    align: 'right',
    size: 'w-[13rem] md:w-[15rem] lg:w-[17rem]', // 📌 이미지 4번 크기
  },
  {
    src: '/images/landing/ShiftTypeSupport_5.png',
    title: '근무 유형 관리',
    desc: (
      <>
        다양한 근무 유형 지원과
        <br className="block md:hidden" />
        업무 강도 설정까지
      </>
    ),
    sub: '근무 형태별 시간, 강도, 규칙을 자유롭게 관리하세요.',
    align: 'left',
    size: 'w-[18rem] md:w-[22rem] lg:w-[24rem]', // 📌 이미지 5번 크기
  },
];

const LandingSection = ({ feature }: any) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.3, // 섹션이 30% 보이면 트리거
    triggerOnce: true, // 한 번만 실행
  });

  React.useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        x: 0, // 원래 자리로 이동
        transition: { duration: 1.2, ease: 'easeOut' },
      });
    }
  }, [controls, inView]);

  // 들어오기 전 상태 (왼쪽 또는 오른쪽)
  const initialX = feature.align === 'right' ? 80 : -80;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: initialX }}
      animate={controls}
      className={`flex flex-col ${
        feature.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'
      } items-center justify-between gap-[2.5rem] md:gap-[3rem]`}
    >
      {/* 텍스트 영역 */}
      <div className="flex-1 text-center md:text-left">
        <p className="font-semibold text-[#FF6B00] text-[0.9rem] md:text-[1rem] mb-[0.5rem]">
          {feature.title}
        </p>
        <h3 className="break-keep text-[1.4rem] md:text-[1.75rem] font-bold text-gray-900 leading-[2rem] md:leading-snug mb-[0.75rem] max-w-[20rem] md:max-w-[30rem] mx-auto md:mx-0">
          {feature.desc}
        </h3>
        <p className="text-gray-600 text-[0.95rem] md:text-[1rem] leading-[1.6rem] md:leading-[1.75rem] max-w-[30rem] mx-auto md:mx-0">
          {feature.sub}
        </p>
      </div>

      {/* 이미지 영역 */}
      <div className="flex-1 flex justify-center">
        <img
          src={feature.src}
          alt={feature.title}
          className={`${feature.size} rounded-[0.75rem]`}
        />
      </div>
    </motion.div>
  );
};

const LandingMain: React.FC = () => {
  return (
    <main className="w-full bg-white py-[4rem] px-[1.5rem] md:py-[6rem] md:px-[6rem]">
      <div className="flex flex-col gap-[5rem] max-w-[90rem] mx-auto">
        {features.map((feature, index) => (
          <LandingSection key={index} feature={feature} index={index} />
        ))}
      </div>
    </main>
  );
};
export default LandingMain;
