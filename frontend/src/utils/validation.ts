export const validateName = (
  name: string
): { isValid: boolean; message: string } => {
  // 한글/영문 + 공백 허용
  const nameRegex = /^[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9 ]*$/;

  // 금지된 이름 목록
  const forbiddenNames = [
    // 서비스 관련
    'dutymate',
    'duty',
    'mate',
    '듀티메이트',
    '듀티',
    '메이트',

    // 관리자/시스템 관련
    'admin',
    'administrator',
    'system',
    'owner',
    'master',
    'root',
    'manager',
    'staff',
    'support',
    'help',
    '관리자',
    '어드민',
    '시스템',
    '운영자',
    '매니저',

    // 직위 관련
    '수간호사',
    '간호부장',
    '간호과장',
    '간호사',
    '간호팀장',
    '병원장',

    // 서비스 신뢰성 관련
    'official',
    'test',
    'tester',
    'guest',
    '공식',
    '테스트',
    '게스트',

    // 이름, 닉네임 관련
    'name',
    'nickname',
    '이름',
    '닉네임',
  ];

  // 대소문자 구분 없이 비교하기 위해 소문자로 변환
  const lowerName = name.toLowerCase();
  if (
    forbiddenNames.some((forbidden) => forbidden.toLowerCase() === lowerName)
  ) {
    return {
      isValid: false,
      message: '사용할 수 없는 이름입니다.',
    };
  }

  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      message: '이름은 한글 또는 영문만 입력 가능합니다.',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

export const validateNickname = (
  nickname: string
): { isValid: boolean; message: string } => {
  // 한글/영문만 허용 (숫자/공백/특수문자 모두 불가)
  const nicknameRegex = /^[A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ0-9 ]*$/;

  // 금지된 닉네임 목록 (이름과 동일한 목록 사용)
  const forbiddenNicknames = [
    // 서비스 관련
    'dutymate',
    'duty',
    'mate',
    '듀티메이트',
    '듀티',
    '메이트',

    // 관리자/시스템 관련
    'admin',
    'administrator',
    'system',
    'owner',
    'master',
    'root',
    'manager',
    'staff',
    'support',
    'help',
    '관리자',
    '어드민',
    '시스템',
    '운영자',
    '매니저',

    // 직위 관련
    '수간호사',
    '간호부장',
    '간호과장',
    '간호사',
    '간호팀장',
    '병원장',

    // 서비스 신뢰성 관련
    'official',
    'test',
    'tester',
    'guest',
    '공식',
    '테스트',
    '게스트',

    // 이름, 닉네임 관련
    'name',
    'nickname',
    '이름',
    '닉네임',
  ];

  // 대소문자 구분 없이 비교하기 위해 소문자로 변환
  const lowerNickname = nickname.toLowerCase();
  if (
    forbiddenNicknames.some(
      (forbidden) => forbidden.toLowerCase() === lowerNickname
    )
  ) {
    return {
      isValid: false,
      message: '사용할 수 없는 닉네임입니다.',
    };
  }

  if (!nicknameRegex.test(nickname)) {
    return {
      isValid: false,
      message: '닉네임은 한글 또는 영문만 입력 가능합니다.',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};
