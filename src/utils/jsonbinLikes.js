// JSONBin.io를 이용한 좋아요 시스템 (가장 간단)
class JSONBinLikeStorage {
  constructor() {
    // JSONBin.io 설정 (무료 계정으로 충분)
    this.apiKey = import.meta.env.PUBLIC_JSONBIN_API_KEY || '';
    this.binId = import.meta.env.PUBLIC_JSONBIN_BIN_ID || '';
    this.fallbackToLocal = !this.apiKey || !this.binId;
    
    // 캐시를 위한 메모리 저장소
    this.cache = null;
    this.cacheTime = 0;
    this.cacheTimeout = 30000; // 30초 캐시
  }

  async getLikes(postSlug) {
    if (this.fallbackToLocal) {
      return this.getLocalLikes(postSlug);
    }

    try {
      const data = await this.fetchData();
      return data[postSlug] || 0;
    } catch (error) {
      console.warn('JSONBin 호출 실패, 로컬 저장소 사용:', error);
      return this.getLocalLikes(postSlug);
    }
  }

  async setLikes(postSlug, count) {
    if (this.fallbackToLocal) {
      return this.setLocalLikes(postSlug, count);
    }

    try {
      const data = await this.fetchData();
      data[postSlug] = count;
      
      const response = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey,
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // 캐시 업데이트
        this.cache = data;
        this.cacheTime = Date.now();
        
        // 로컬에도 백업 저장
        this.setLocalLikes(postSlug, count);
        return true;
      }
      
      throw new Error('JSONBin 업데이트 실패');
    } catch (error) {
      console.warn('JSONBin 업데이트 실패, 로컬 저장소 사용:', error);
      return this.setLocalLikes(postSlug, count);
    }
  }

  async fetchData() {
    // 캐시 확인
    if (this.cache && (Date.now() - this.cacheTime) < this.cacheTimeout) {
      return this.cache;
    }

    const response = await fetch(`https://api.jsonbin.io/v3/b/${this.binId}/latest`, {
      headers: {
        'X-Master-Key': this.apiKey,
      }
    });

    if (!response.ok) {
      throw new Error('JSONBin 데이터 가져오기 실패');
    }

    const result = await response.json();
    this.cache = result.record || {};
    this.cacheTime = Date.now();
    
    return this.cache;
  }

  // 로컬 저장소 폴백 메서드
  getLocalLikes(postSlug) {
    const likes = localStorage.getItem(`likes-${postSlug}`);
    return parseInt(likes) || 0;
  }

  setLocalLikes(postSlug, count) {
    localStorage.setItem(`likes-${postSlug}`, count.toString());
    return true;
  }

  isLiked(postSlug) {
    return localStorage.getItem(`liked-${postSlug}`) === 'true';
  }

  setLiked(postSlug, liked) {
    localStorage.setItem(`liked-${postSlug}`, liked.toString());
  }
}

export default JSONBinLikeStorage;