# 🍊 만다린 (Mandarin)

![썸네일](./frontend/public/images/landing-village.webp)

<br />

## 🍊 프로젝트 소개

**''' 목표를 실천하면 마을이 자랍니다 '''**

<b>새해마다</b> 계획을 세우지만, 그 계획표를 다시 열어본 적이 있으신가요? <br/>
81칸을 혼자 채우려니 3칸도 못 가서 막히지는 않으셨나요?

<b>목표를 세워도</b> 오늘 뭘 해야 하는지 모르겠고, <br/>
꾸준히 해도 눈에 보이는 게 없어 그만두게 되지는 않으셨나요?

이제 만다린과 함께라면, 계획을 세우는 것도 지키는 것도 즐거워집니다  <br/>
**AI 코치와 만다라트를 채우고, 매일의 과제가 나만의 3D 도시로 자라납니다.**

<br />



## 🍊 팀원 소개

| 정희성 | 황우찬 | 권병수 | 김재현 | 이성현 | 지상근 |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **팀장** | **PM** | 팀원 | 팀원 | 팀원 | 팀원 |
| Infra · Back End | AI · Back End | Back End | Back End | Front End | Front End |

<br />
<br />

## 🍊 주요 기능

- **만다라트 작성**
  - 가운데 최종 목표 1개, 세부 목표 8개, 과제 64개로 이루어진 **9×9 계획표** 작성
  - 과제별 주기(일간 / 주간 / 월간 / 없음)와 목표 횟수 설정 및 공개/비공개 설정

- **AI 음성 코치**
  - **LiveKit** 기반 실시간 음성·텍스트 대화로 목표 설계
  - **Deepgram STT** 로 발화를 전사하고, **Gemini** 가 3단계 파이프라인(분류 → 후보 검색 → 판단)으로 과제 3개를 제안
  - 이미 담아둔 과제를 다시 말하면 새로 만들지 않고 **기존 과제를 지목**해 중복 방지
  - 마음에 드는 제안만 골라 만다라트 빈 칸에 바로 적용

- **오늘의 할 일**
  - 과제 주기에 맞춰 오늘 수행할 과제를 자동으로 모아 제공
  - 수행완료시 포인트 적립 

- **3D 마을**
  - **three.js** 3D 마을
  - 진행률이 오르면 **건물이 단계별로 성장**
  - 지형 및 배경 교체, 건물 배치·회전, 중앙 랜드마크 성장

- **상점 & 마일스톤 보상**
  - 적립한 포인트로 테마별 건물 구매
  - 진행률 12.5% 구간마다 포인트 혹은 랜드마크 지급

- **AI 주간 리포트**
  -  AI가 한 주의 수행 기록을 분석해 리포트 생성 

- **친구 & 리더보드**
  - 친구 코드로 검색·요청·수락, 친구의 공개 만다라트 열람
  - 포인트 기준 리더보드 랭킹


<br />
<br />

## 🍊 기술 스택

### **Frontend**

<img src="https://img.shields.io/badge/Visual Studio Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white"> <img src="https://img.shields.io/badge/React_19.2-61DAFB?style=for-the-badge&logo=React&logoColor=black"> <img src="https://img.shields.io/badge/TypeScript_6.0-3178C6?style=for-the-badge&logo=TypeScript&logoColor=white"> <img src="https://img.shields.io/badge/Vite_8.1-646CFF?style=for-the-badge&logo=Vite&logoColor=white"> <br> <img src="https://img.shields.io/badge/Tailwind CSS_4.1-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white"> <img src="https://img.shields.io/badge/React Router_7.18-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white"> <img src="https://img.shields.io/badge/Three.js_0.171-000000?style=for-the-badge&logo=Three.js&logoColor=white"> <img src="https://img.shields.io/badge/React Three Fiber-000000?style=for-the-badge&logo=Three.js&logoColor=white"> <br> <img src="https://img.shields.io/badge/livekit_client_2.21-1E1E1E?style=for-the-badge&logo=livekit&logoColor=white"> <img src="https://img.shields.io/badge/Oxlint-CC0000?style=for-the-badge&logo=oxc&logoColor=white"> <img src="https://img.shields.io/badge/Node.js_22-339933?style=for-the-badge&logo=Node.js&logoColor=white">

### **Backend**

<img src="https://img.shields.io/badge/IntelliJ IDEA-000000?style=for-the-badge&logo=intellijidea&logoColor=white"> <img src="https://img.shields.io/badge/Java_21-007396?style=for-the-badge&logo=openjdk&logoColor=white"> <img src="https://img.shields.io/badge/Spring Boot_4.0.6-6DB33F?style=for-the-badge&logo=SpringBoot&logoColor=white"> <img src="https://img.shields.io/badge/Spring Security-6DB33F?style=for-the-badge&logo=SpringSecurity&logoColor=white"> <br> <img src="https://img.shields.io/badge/Spring Data JPA-6DB33F?style=for-the-badge&logo=&logoColor=white"> <img src="https://img.shields.io/badge/QueryDSL_5.1-0769AD?style=for-the-badge&logo=&logoColor=white"> <img src="https://img.shields.io/badge/OAuth2 Kakao-FFCD00?style=for-the-badge&logo=kakao&logoColor=black"> <img src="https://img.shields.io/badge/JWT_jjwt_0.12.6-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"> <br> <img src="https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=PostgreSQL&logoColor=white"> <img src="https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=Redis&logoColor=white"> <img src="https://img.shields.io/badge/Flyway-CC0200?style=for-the-badge&logo=flyway&logoColor=white"> <img src="https://img.shields.io/badge/Swagger_springdoc_3-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black">

### **AI**

<img src="https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=Python&logoColor=white"> <img src="https://img.shields.io/badge/LiveKit Agents_1.6.7-1E1E1E?style=for-the-badge&logo=livekit&logoColor=white"> <img src="https://img.shields.io/badge/LiveKit Server_1.13.5-1E1E1E?style=for-the-badge&logo=livekit&logoColor=white"> <br> <img src="https://img.shields.io/badge/Gemini_2.5 Flash-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white"> <img src="https://img.shields.io/badge/Deepgram_Nova--3-13EF93?style=for-the-badge&logo=deepgram&logoColor=black"> <img src="https://img.shields.io/badge/Pydantic_v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white"> <img src="https://img.shields.io/badge/pytest-0A9EDC?style=for-the-badge&logo=pytest&logoColor=white">

### **CI/CD**

<img src="https://img.shields.io/badge/AWS EC2-232F3E?style=for-the-badge&logo=AmazonEC2&logoColor=white"> <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=Docker&logoColor=white"> <img src="https://img.shields.io/badge/Docker Compose-2496ED?style=for-the-badge&logo=Docker&logoColor=white"> <img src="https://img.shields.io/badge/NGINX-009639?style=for-the-badge&logo=NGINX&logoColor=white"> <br> <img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=Jenkins&logoColor=white"> <img src="https://img.shields.io/badge/GitLab CI-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white"> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=Vercel&logoColor=white"> <img src="https://img.shields.io/badge/Let's Encrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white">

### **Communication**

<img src="https://img.shields.io/badge/Git(GitLab)-FC6D26?style=for-the-badge&logo=Gitlab&logoColor=white"> <img src="https://img.shields.io/badge/Jira-0052CC?style=for-the-badge&logo=Jira&logoColor=white"> <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=Notion&logoColor=white"> <img src="https://img.shields.io/badge/Mattermost-0058CC?style=for-the-badge&logo=Mattermost&logoColor=white"> <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=Figma&logoColor=white">

<br />

## 🍊 시스템 아키텍처

![시스템아키텍처](./docs/assets/시스템아키텍처.png)


<br />

## 🍊 ERD
![ERD](./docs/assets/ERD.png)

<br />

## 🍊 산출물

- [요구사항명세서](./docs/assets/요구사항명세서.png)
- [기능명세서](./docs/assets/기능명세서.png)
- [API명세서](./docs/assets/API명세서.png)

- [와이어프레임](./docs/와이어프레임.pdf)
- [목업](./docs/목업.png)

- [중간 발표 자료](./docs/만다린_중간발표.pptx)
- [최종 발표 자료](./docs/최종PPTv7.pptx)

<br />


<br />

## 🍊 화면 구성
- [화면 구성 시나리오](./exec/시나리오.md)
