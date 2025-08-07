// 읽기 시간 계산 유틸리티
export function calculateReadingTime(content) {
  // 입력값 검증
  if (!content || typeof content !== 'string') {
    return {
      minutes: 1,
      words: 0,
      text: '1 min read'
    };
  }
  
  // 평균 읽기 속도: 분당 200-250 단어 (한국어 기준으로 조정)
  const wordsPerMinute = 200;
  
  // 이미지와 코드 블록 개수 계산 (추가 읽기 시간 고려)
  const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;
  
  // HTML 태그와 마크다운 문법 제거 (하지만 내용은 유지)
  let cleanText = content
    .replace(/<[^>]*>/g, '') // HTML 태그 제거
    .replace(/!\[.*?\]\(.*?\)/g, ' [이미지] ') // 이미지를 플레이스홀더로 대체
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 링크는 텍스트만 유지
    .replace(/```[\s\S]*?```/g, ' [코드블록] ') // 코드 블록을 플레이스홀더로 대체
    .replace(/`([^`]+)`/g, '$1') // 인라인 코드는 내용 유지
    .replace(/#{1,6}\s/g, '') // 헤더 마크다운 제거
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 볼드는 내용 유지
    .replace(/\*([^*]+)\*/g, '$1') // 이탤릭은 내용 유지
    .replace(/^\s*[-*+]\s/gm, '') // 리스트 마크다운 제거
    .replace(/^\s*\d+\.\s/gm, '') // 번호 리스트 마크다운 제거
    .replace(/\n+/g, ' ') // 개행 문자를 공백으로 변환
    .trim();
  
  // 단어 수 계산 (한국어 + 영어 혼합 고려)
  const koreanChars = (cleanText.match(/[가-힣]/g) || []).length;
  const englishWords = (cleanText.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (cleanText.match(/\d+/g) || []).length;
  
  // 한국어는 글자 수 기준, 영어는 단어 수 기준
  // 한국어 1글자 ≈ 영어 0.5단어로 계산
  const textWords = (koreanChars * 0.5) + englishWords + numbers;
  
  // 이미지와 코드 블록에 대한 추가 시간 계산
  // 이미지: 각각 15초 (0.25분), 코드 블록: 각각 30초 (0.5분)
  const imageTime = imageCount * 0.25;
  const codeTime = codeBlockCount * 0.5;
  
  // 총 읽기 시간 계산
  const totalMinutes = (textWords / wordsPerMinute) + imageTime + codeTime;
  const minutes = Math.max(1, Math.ceil(totalMinutes));
  
  // 디버깅 정보 (개발 환경에서만)
  if (typeof window !== 'undefined' && import.meta.env?.DEV) {
    console.log('Reading time calculation details:', {
      originalLength: content.length,
      cleanTextLength: cleanText.length,
      koreanChars,
      englishWords,
      numbers,
      textWords,
      imageCount,
      codeBlockCount,
      imageTime,
      codeTime,
      totalMinutes,
      minutes
    });
  }
  
  return {
    minutes,
    words: Math.round(textWords),
    text: `${minutes} min read`
  };
}

// 읽기 시간 아이콘 컴포넌트용 SVG
export const ReadingTimeIcon = `
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
`;