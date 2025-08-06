// 읽기 시간 계산 유틸리티
export function calculateReadingTime(content) {
  // 평균 읽기 속도: 분당 200-250 단어 (한국어 기준으로 조정)
  const wordsPerMinute = 200;
  
  // HTML 태그 제거
  const cleanText = content.replace(/<[^>]*>/g, '');
  
  // 단어 수 계산 (한국어 + 영어 혼합 고려)
  const koreanChars = (cleanText.match(/[가-힣]/g) || []).length;
  const englishWords = (cleanText.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (cleanText.match(/\d+/g) || []).length;
  
  // 한국어는 글자 수 기준, 영어는 단어 수 기준
  // 한국어 1글자 ≈ 영어 0.5단어로 계산
  const totalWords = (koreanChars * 0.5) + englishWords + numbers;
  
  // 읽기 시간 계산 (최소 1분)
  const minutes = Math.max(1, Math.ceil(totalWords / wordsPerMinute));
  
  return {
    minutes,
    words: Math.round(totalWords),
    text: `${minutes} min read`
  };
}

// 읽기 시간 아이콘 컴포넌트용 SVG
export const ReadingTimeIcon = `
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
`;