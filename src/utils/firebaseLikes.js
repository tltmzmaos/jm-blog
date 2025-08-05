// Firebase를 이용한 좋아요 시스템 (더 간단한 방법)
class FirebaseLikeStorage {
  constructor() {
    // Firebase 설정 (환경변수로 관리)
    this.projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || '';
    this.apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY || '';
    this.fallbackToLocal = !this.projectId || !this.apiKey;
  }

  async getLikes(postSlug) {
    if (this.fallbackToLocal) {
      return this.getLocalLikes(postSlug);
    }

    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/likes/${postSlug}?key=${this.apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return parseInt(data.fields?.count?.integerValue || '0');
      }
      
      return 0;
    } catch (error) {
      console.warn('Firebase 호출 실패, 로컬 저장소 사용:', error);
      return this.getLocalLikes(postSlug);
    }
  }

  async setLikes(postSlug, count) {
    if (this.fallbackToLocal) {
      return this.setLocalLikes(postSlug, count);
    }

    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/likes/${postSlug}?key=${this.apiKey}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              count: { integerValue: count.toString() },
              updatedAt: { timestampValue: new Date().toISOString() }
            }
          })
        }
      );

      if (response.ok) {
        // 로컬에도 백업 저장
        this.setLocalLikes(postSlug, count);
        return true;
      }
      
      throw new Error('Firebase 업데이트 실패');
    } catch (error) {
      console.warn('Firebase 업데이트 실패, 로컬 저장소 사용:', error);
      return this.setLocalLikes(postSlug, count);
    }
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

export default FirebaseLikeStorage;