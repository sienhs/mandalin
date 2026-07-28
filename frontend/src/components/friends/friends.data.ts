import type { Friend, FriendTab } from './friends.types'

/** 친구 API 응답이 없을 때 화면 확인에 사용하는 fallback 데이터. */
export const MOCK_FRIENDS: Friend[] = [
  { id: 1, name: '김서연', avatarColor: 'bg-[#FF7A21]' },
  { id: 2, name: '이도현', avatarColor: 'bg-[#4285F4]' },
  { id: 3, name: '박하늘', avatarColor: 'bg-[#A78BFA]' },
  { id: 4, name: '최윤아', avatarColor: 'bg-[#FFA510]' },
  { id: 5, name: '문지호', avatarColor: 'bg-[#3FBF7F]' },
  { id: 6, name: '정다은', avatarColor: 'bg-[#E85D8A]' },
  { id: 7, name: '한민재', avatarColor: 'bg-[#28A9E0]' },
  { id: 8, name: '윤서진', avatarColor: 'bg-[#FF9A3D]' },
  { id: 9, name: '조은채', avatarColor: 'bg-[#7A78E8]' },
  { id: 10, name: '송현우', avatarColor: 'bg-[#45B8AC]' },
  { id: 11, name: '임수아', avatarColor: 'bg-[#F06B8D]' },
  { id: 12, name: '오지민', avatarColor: 'bg-[#5B8DEF]' },
]

/** 친구 요청 API 응답이 없을 때 사용하는 fallback 데이터. */
export const MOCK_REQUESTS: Friend[] = [
  { id: 201, name: '정수빈', avatarColor: 'bg-[#3FBF7F]' },
  { id: 202, name: '황태양', avatarColor: 'bg-[#E85D8A]' },
  { id: 203, name: '배소민', avatarColor: 'bg-[#28A9E0]' },
  { id: 204, name: '한지우', avatarColor: 'bg-[#FF7A21]' },
  { id: 205, name: '강민준', avatarColor: 'bg-[#A78BFA]' },
  { id: 206, name: '오하윤', avatarColor: 'bg-[#3FBF7F]' },
]

/** UID 검색 API 연결 전 표시하는 fallback 검색 결과. */
export const MOCK_SEARCH_RESULT: Friend = {
  id: 101,
  name: '김서연',
  avatarColor: 'bg-[#FF7A21]',
}

export const FRIEND_TABS: Array<{ id: FriendTab; label: string }> = [
  { id: 'friends', label: '내 친구' },
  { id: 'search', label: '친구 찾기' },
  { id: 'requests', label: '친구 요청' },
]
