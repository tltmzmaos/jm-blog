export function calculateReadingTime(content) {
  if (!content || typeof content !== 'string') {
    return { minutes: 1, words: 0, text: '1 min read' };
  }

  const wordsPerMinute = 200;

  const imageCount = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const codeBlockCount = (content.match(/```[\s\S]*?```/g) || []).length;

  const cleanText = content
    .replace(/<[^>]*>/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .replace(/\n+/g, ' ')
    .trim();

  const koreanChars = (cleanText.match(/[가-힣]/g) || []).length;
  const englishWords = (cleanText.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (cleanText.match(/\d+/g) || []).length;

  const textWords = (koreanChars * 0.5) + englishWords + numbers;
  const imageTime = imageCount * 0.25;
  const codeTime = codeBlockCount * 0.5;

  const totalMinutes = (textWords / wordsPerMinute) + imageTime + codeTime;
  const minutes = Math.max(1, Math.ceil(totalMinutes));

  return {
    minutes,
    words: Math.round(textWords),
    text: `${minutes} min read`
  };
}

export const ReadingTimeIcon = `
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
`;
