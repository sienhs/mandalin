# 건물 썸네일 (static PNG)

상점/목록에서 `<img>`로 가볍게 쓰는 건물 썸네일 이미지 폴더.

## 뽑는 법
1. `npm run dev` → `/thumbnails` 접속 (썸네일 스튜디오)
2. 단계(1/2/3)·배경 선택 후 **[전체 PNG 저장]** 클릭 (또는 카드별 [PNG 저장])
3. 다운로드된 `{key}_s{stage}.png` 파일들을 이 폴더(`public/thumbnails/`)에 넣기
   - 예: `hospital_s3.png`, `cafe_s3.png` …
   - 파일명 규칙은 `src/village/thumbnails.ts`의 `thumbnailSrc()`와 일치해야 함

## 동작
- `BuildingImage` 컴포넌트가 이 PNG를 우선 로드.
- 파일이 없으면 자동으로 라이브 3D 렌더(`BuildingThumbnail`)로 폴백하므로,
  아직 안 뽑은 건물도 목록에서 깨지지 않음.

상점 기본은 3단계(완성) 썸네일. 필요하면 단계별로도 뽑아둘 수 있음.
