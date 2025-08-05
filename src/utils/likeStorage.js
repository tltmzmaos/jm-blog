// GitHub Gist를 이용한 좋아요 저장소
class GitHubLikeStorage {
  constructor() {
    // GitHub Personal Access Token (public repo 권한만 필요)
    // 실제 사용시에는 환경변수로 관리하세요
    this.token = import.meta.env.PUBLIC_GITHUB_TOKEN || '';
    this.gistId = import.meta.env.PUBLIC_GIST_ID || '';
    this.fallbackToLocal = !this.token || !this.gistId;
  }

  async getLikes(postSlug) {
    if (this.fallbackToLocal) {
      return this.getLocalLikes(postSlug);
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
      const gist = await response.json();
      
      if (gist.files && gist.files['likes.json']) {
        const likesData = JSON.parse(gist.files['likes.json'].content);
        return likesData[postSlug] || 0;
      }
      
      return 0;
    } catch (error) {
      console.warn('GitHub API 호출 실패, 로컬 저장소 사용:', error);
      return this.getLocalLikes(postSlug);
    }
  }

  async setLikes(postSlug, count) {
    if (this.fallbackToLocal) {
      return this.setLocalLikes(postSlug, count);
    }

    try {
      // 현재 데이터 가져오기
      const response = await fetch(`https://api.github.com/gists/${this.gistId}`);
      const gist = await response.json();
      
      let likesData = {};
      if (gist.files && gist.files['likes.json']) {
        likesData = JSON.parse(gist.files['likes.json'].content);
      }
      
      // 데이터 업데이트
      likesData[postSlug] = count;
      
      // Gist 업데이트
      const updateResponse = await fetch(`https://api.github.com/gists/${this.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            'likes.json': {
              content: JSON.stringify(likesData, null, 2)
            }
          }
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Gist 업데이트 실패');
      }

      // 로컬에도 백업 저장
      this.setLocalLikes(postSlug, count);
      
      return true;
    } catch (error) {
      console.warn('GitHub API 업데이트 실패, 로컬 저장소 사용:', error);
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

export default GitHubLikeStorage;