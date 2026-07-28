import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import "./SheetCreate.css";
interface sheet {
    user_id: number;        //사용자 아이디
    title: string;          //시트명(핵심 목표)
    is_open: boolean;       //공개 여부
    like: number;           //좋아요 수
    created_at: string;     //생성 날짜
    expired_at: string;     //만료 날짜
}

interface domain {
    sheet_id: number;               //시트 아이디
    domain_template_id: number;     //참고 도메인 아이디
    title: string;                  //도메인 명
    position: number;               //위치
    create_at: string;              //생성 날짜
    subject_count: number;          //완료한 과제 갯수
}

interface subject {
    domain_id: number;              //도메인 아이디
    user_id: number;                //유저 아이디
    title: string;                  //태스크 이름
    period: 'daily' | 'weekly' | 'none';    //기간 설정
    point: number;                  //획득 포인트
    target_count: number;           //목표횟수
    try_count: number;              //현재 횟수
    position: number;               //위치
    is_done: boolean;               //완료 여부
    create_at: string;              //생성 날짜
    updated_at: string;             //수정 날짜
}

interface SubjectTemplate extends Partial<subject> {      //추천 태스크 (subject 기반)
    emoji: string;                  //추천 태스크 이모지
    domain_name: string;            //추천 태스크의 도메인명
}



//태스크 입력시 날짜를 선택했을 때 바뀔 변수. 현재와 1달후를 기본으로 한다.
const start: Date = new Date();
const end: Date = new Date();
end.setMonth(start.getMonth() + 1);

//날짜를 'YYYY-MM-DD' 형식으로 출력
const formatDate = (date: Date): string => {
    return date.toLocaleDateString('sv-SE'); // 
};

//초기 핵심 목표.
const INITIAL_MAIN_GOAL: string = "건강한 몸 만들기";

//각 도메인의 색. light = 일반 태스크 칸, dark = 도메인(라벨) 칸
const DOMAIN_COLORS: Record<number, { light: string; dark: string }> = {
    0: { light: "bg-emerald-200 text-ink-900", dark: "bg-emerald-500 text-white" },
    1: { light: "bg-red-300 text-ink-900", dark: "bg-red-500 text-white" },
    2: { light: "bg-orange-300 text-ink-900", dark: "bg-orange-500 text-white" },
    3: { light: "bg-sky-300 text-ink-900", dark: "bg-sky-500 text-white" },
    4: { light: "bg-ink-900 text-white", dark: "bg-ink-900 text-white" },
    5: { light: "bg-violet-300 text-ink-900", dark: "bg-violet-500 text-white" },
    6: { light: "bg-amber-200 text-ink-900", dark: "bg-amber-500 text-white" },
    7: { light: "bg-pink-300 text-ink-900", dark: "bg-pink-500 text-white" },
    8: { light: "bg-blue-300 text-ink-900", dark: "bg-blue-500 text-white" },
};

const getCellColor = (b: number, c: number) => {
    if (b === 4) {
        if (c === 4) return "bg-ink-900 text-white font-extrabold";
        return `${DOMAIN_COLORS[c]?.dark || "bg-ink-300"} font-extrabold`;
    }
    if (c === 4) {
        return `${DOMAIN_COLORS[b]?.dark || "bg-ink-300"} font-extrabold`;
    }
    return DOMAIN_COLORS[b]?.light || "bg-ink-100";
};

//줄바꿈 함수. 6글자 이상이면 줄바꿈을 진행한다. 중간에 띄어쓰기가 있으면 띄어쓰기를 기준으로.
//아니면 반반으로 나눈다.
const formatText = (text: string) => {
    if (!text || text.length < 6) return text;

    if (text.includes(" ")) {
        const parts = text.split(" ");
        if (parts.length === 2) {
            return (
                <>
                    {parts[0]}<br />{parts[1]}
                </>
            );
        }
        let midIdx = Math.floor(text.length / 2);
        let splitIdx = text.indexOf(" ");
        let minDiff = Math.abs(midIdx - splitIdx);

        for (let i = splitIdx + 1; i < text.length; i++) {
            if (text[i] === ' ') {
                let diff = Math.abs(midIdx - i);
                if (diff < minDiff) {
                    minDiff = diff;
                    splitIdx = i;
                }
            }
        }

        return (
            <>
                {text.slice(0, splitIdx)}<br />{text.slice(splitIdx + 1)}
            </>
        );
    }

    const mid = Math.ceil(text.length / 2);
    return (
        <>
            {text.slice(0, mid)}<br />{text.slice(mid)}
        </>
    );
};


const TaskRecommend: SubjectTemplate[] = [
    { emoji: "🥗", title: "샐러드 1끼 먹기", domain_name: "식단", period: 'daily' },
    { emoji: "🚫", title: "당류 섭취 줄이기", domain_name: "식단", period: 'none' },
    { emoji: "💊", title: "영양제 챙겨 먹기", domain_name: "식단", period: 'daily' },
]


//설치 가능한 건물의 페이지
const PAGES = ["‹", "1", "2", "3", "›"];

//화면의 기본 설정
export default function MandalartCreate() {
    //현재 선택된 2D칸의 내용 반환
    const [sheetData, setSheetData] = useState<sheet>({
        user_id: 1,
        title: INITIAL_MAIN_GOAL,
        is_open: true,
        like: 0,
        created_at: formatDate(start),
        expired_at: formatDate(end)
    });
    const [domains, setDomains] = useState<(domain | null)[]>(Array.from({ length: 8 }, () => null));
    const [subjects, setSubjects] = useState<(subject | null)[][]>(Array.from({ length: 8 }, () => Array(8).fill(null)));

    // 가상의 9x9 배열 생성
    const derivedGrid = Array.from({ length: 9 }, (_, b) =>
        Array.from({ length: 9 }, (_, c) => {
            if (b === 4) {
                if (c === 4) return { task: sheetData.title, label: true, isSheet: true, isDomain: false, isSubject: false, cellIndex: -1, domainIndex: -1, subjectIndex: -1 };
                const dIndex = c < 4 ? c : c - 1;
                const d = domains[dIndex];
                return { task: d ? d.title : "+도메인 추가", label: true, isSheet: false, isDomain: true, isSubject: false, domainIndex: dIndex, subjectIndex: -1 };
            }

            const dIndex = b < 4 ? b : b - 1;
            if (c === 4) {
                const d = domains[dIndex];
                return { task: d ? d.title : "+도메인 추가", label: true, isSheet: false, isDomain: true, isSubject: false, domainIndex: dIndex, subjectIndex: -1 };
            }

            const sIndex = c < 4 ? c : c - 1;
            const s = subjects[dIndex]?.[sIndex];
            return {
                task: s ? s.title : "+태스크 추가",
                done: s ? s.is_done : false,
                isSheet: false,
                isDomain: false,
                isSubject: true,
                domainIndex: dIndex,
                subjectIndex: sIndex,
                ...(s || {})
            };
        })
    );

    //기본으로 만다라트 생성시 공개, 비공개를 설정한다. true = 공개
    const [isPublic, setIsPublic] = useState(true);
    //2D 뷰에서 어떤 칸이 선택되었는지(블록번호-셀번호)의 형태
    const [selected2d, setSelected2d] = useState<string | null>(null);

    //추가 가능한 과제의 기본 페이지 설정.
    const [page2d, setPage2d] = useState("1");

    //저장 팝업이 열려있는지 여부
    const [saveOpen, setSaveOpen] = useState(false);
    //취소 팝업이 열려있는지 여부
    const [cancelOpen, setCancelOpen] = useState(false);

    //태스크 설정 팝업 열려있는지 여부
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    //어떤 창의 태스크를 설정중인지 설정.(블록번호-셀번호)
    const [activeCellForModal, setActiveCellForModal] = useState<{ b: number, c: number } | null>(null);
    //현재 작성중인 임시 데이터 기억
    const [modalTaskData, setModalTaskData] = useState<any>({});
    //만다라트 전체 목표의 시작 날짜 기억.
    const [startDate, setStartDate] = useState(formatDate(start));
    //만다라트 전체 목표의 끝 날짜 기억.
    const [endDate, setEndDate] = useState(formatDate(end));

    //각 칸의 팝업 저장 시 셀 내용 변경 핸들러
    const handleModalSave = () => {
        if (!activeCellForModal) return;
        const { b, c } = activeCellForModal;
        const cellData = derivedGrid[b][c];

        if (cellData.isSheet) return; // 중앙의 핵심목표는 좌측 패널에서 수정

        if (cellData.isDomain) {
            const dIndex = cellData.domainIndex;
            setDomains(prev => {
                const newDomains = [...prev];
                newDomains[dIndex] = {
                    ...(newDomains[dIndex] || {
                        sheet_id: 1,
                        domain_template_id: 1, // dummy
                        position: dIndex,
                        create_at: formatDate(new Date()),
                        subject_count: 0
                    }),
                    title: modalTaskData.task || modalTaskData.title || "+도메인 추가"
                };
                return newDomains;
            });
        } else if (cellData.isSubject) {
            const { domainIndex, subjectIndex } = cellData;
            setSubjects(prev => {
                const newSubjects = [...prev];
                newSubjects[domainIndex] = [...newSubjects[domainIndex]];

                const existing = newSubjects[domainIndex][subjectIndex] || {
                    domain_id: domainIndex + 1,
                    user_id: 1,
                    title: "",
                    period: 'none',
                    point: 10,
                    target_count: 1,
                    try_count: 0,
                    position: subjectIndex,
                    is_done: false,
                    create_at: formatDate(new Date()),
                    updated_at: formatDate(new Date())
                };

                newSubjects[domainIndex][subjectIndex] = {
                    ...existing,
                    title: modalTaskData.task || modalTaskData.title,
                    period: modalTaskData.deadlineType || existing.period,
                    target_count: cntChecker(modalTaskData.deadlineType || existing.period),
                    is_done: modalTaskData.done ?? existing.is_done,
                    updated_at: formatDate(new Date())
                };
                return newSubjects;
            });
        }
    };

    //태스크 세부작성 팝업
    const openTaskModal = (b: number, c: number) => {
        setActiveCellForModal({ b, c });
        const cellData = derivedGrid[b][c];
        if (cellData.isSheet) return;

        const cellDomain = cellData.isSubject ? (domains[cellData.domainIndex]?.title || "+도메인 추가") : "+도메인 추가";

        setModalTaskData({
            ...cellData,
            title: cellData.task,
            domain: cellDomain !== "+도메인 추가" ? cellDomain : "미지정",
            targetNum: 'target_count' in cellData ? cellData.target_count : 0,
            deadlineType: 'period' in cellData ? cellData.period : 'none',
        });
        setTaskModalOpen(true);
    };

    //칸을 클릭하고 추천 태스크의 추가를 누르면 해당 칸에 태스크 자동 입력
    const handleAddRecommendTask = (template: SubjectTemplate) => {
        if (!selected2d) {
            alert("태스크를 추가할 빈칸을 먼저 선택해주세요.");
            return;
        }

        const [b, c] = selected2d.split('-').map(Number);
        const cellData = derivedGrid[b][c];

        if (cellData.isSheet) {
            alert("핵심 목표 칸에는 태스크를 추가할 수 없습니다.");
            return;
        }

        if (cellData.isDomain) {
            alert("도메인 칸에는 태스크를 추가할 수 없습니다.");
            return;
        }

        if (cellData.isSubject) {
            const { domainIndex, subjectIndex } = cellData;
            setSubjects(prev => {
                const newSubjects = [...prev];
                newSubjects[domainIndex] = [...newSubjects[domainIndex]];

                const existing = newSubjects[domainIndex][subjectIndex] || {
                    domain_id: domainIndex + 1,
                    user_id: 1,
                    title: "",
                    period: 'none',
                    point: 10,
                    target_count: 1,
                    try_count: 0,
                    position: subjectIndex,
                    is_done: false,
                    create_at: formatDate(new Date()),
                    updated_at: formatDate(new Date())
                };

                newSubjects[domainIndex][subjectIndex] = {
                    ...existing,
                    title: template.title || "",
                    period: template.period || existing.period,
                    target_count: cntChecker(template.period || existing.period),
                    updated_at: formatDate(new Date())
                };
                return newSubjects;
            });
        }
    };

    //입력된 태스크 수 확인 함수.
    const taskChecker = (): number => {
        let cnt = 0;
        const targets = ["+도메인 추가", "+태스크 추가", "+핵심 목표 추가"];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (targets.includes(derivedGrid[i][j].task)) {
                    cnt += 1;
                }
            }
        }
        return 81 - cnt;
    }

    //수행횟수를 자동으로 설정하는 함수.
    const cntChecker = (type: 'daily' | 'weekly' | 'none'): number => {
        if (type === 'none') return 1;
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diffTime = e.getTime() - s.getTime();
        if (diffTime < 0) return 0;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (type === 'daily') return diffDays;
        if (type === 'weekly') return Math.floor(diffDays / 7);
        return 1;
    }


    //9*9 그리드에서 선택된 블록의 인덱스를 계산하여 미니 그리드에 반영
    const selectedBlockIndex = selected2d ? parseInt(selected2d.split('-')[0]) : 0;
    //현재 보여주고 있는 3*3 확대 그리드
    const currentMiniGrid = derivedGrid[selectedBlockIndex];

    // 현재 채워진 태스크 개수 계산
    //const taskNum = 81;
    const taskNum = taskChecker();

    //화면 구현

    return (
        <div className="min-h-screen bg-[#F6F7F8]">
            <Header />
            <main className="mx-auto max-w-[1280px] px-6 pb-[70px] pt-6">
                {/* 헤더: 제목 · 저장/취소 */}
                <header className="mb-[18px] flex items-center justify-between gap-4">
                    <h1 className="section-title m-0 text-[20px]">새 만다라트 만들기</h1>

                    <div className="flex gap-2.5">
                        <button
                            type="button"
                            onClick={() => setCancelOpen(true)}
                            className="btn rounded-[10px] border border-[#e7eaee] bg-white text-ink-400"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={() => setSaveOpen(true)}
                            className="btn rounded-[10px] bg-[#97cca1] text-white shadow-[0_8px_16px_-10px_rgba(151,204,161,0.95)] hover:brightness-[1.04]"
                        >
                            저장 ({taskNum}/81칸 완료)
                        </button>
                    </div>
                </header>

                {/* 좌: 기본 설정(sticky) · 우: 2D/3D 뷰 */}
                <div className="grid grid-cols-[300px_1fr] items-start gap-5">
                    {/* 기본 설정 */}
                    <section
                        className="card sticky top-[84px] flex flex-col gap-4 p-5"
                        aria-labelledby="basic-settings"
                    >
                        <h2 id="basic-settings" className="section-title m-0 text-[15px]">기본 설정</h2>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="core-goal" className="text-xs font-bold text-ink-400">
                                핵심 목표
                            </label>
                            <input
                                id="core-goal"
                                type="text"
                                value={sheetData.title === "+핵심 목표 추가" ? "" : sheetData.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setSheetData((prev) => ({
                                        ...prev,
                                        title: val || "+핵심 목표 추가"
                                    }));
                                }}
                                placeholder="핵심 목표를 입력하세요"
                                className="w-full rounded-[10px] border border-[#e7eaee] px-3 py-[5px] text-[13px] text-ink-900 outline-none focus:border-[#97cca1]"
                            />
                        </div>

                        <fieldset className="m-0 border-0 p-0">
                            <legend className="mb-1.5 p-0 text-xs font-bold text-ink-400">기간 설정</legend>
                            <div className="flex gap-1.5">
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <label htmlFor="start-date" className="sr-only">시작일</label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-[10px] border border-[#e7eaee] px-3 py-[5px] text-[12.5px] text-ink-900 outline-none focus:border-[#97cca1]"
                                    />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <label htmlFor="end-date" className="sr-only">종료일</label>
                                    <input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-[10px] border border-[#e7eaee] px-3 py-[5px] text-[12.5px] text-ink-900 outline-none focus:border-[#97cca1]"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-bold text-ink-400">공개 여부</span>
                            <div className="flex gap-1.5" role="group" aria-label="공개 여부">
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(true)}
                                    aria-pressed={isPublic}
                                    className={`pill cursor-pointer border-0 ${isPublic ? "bg-[#97cca1] text-white" : "bg-[#e3f8f1] text-ink-400"}`}
                                >
                                    공개
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsPublic(false)}
                                    aria-pressed={!isPublic}
                                    className={`pill cursor-pointer border-0 ${!isPublic ? "bg-[#97cca1] text-white" : "bg-[#e3f8f1] text-ink-400"}`}
                                >
                                    비공개
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                className="btn w-full rounded-[10px] bg-[#be5f6b] text-[13px] text-white shadow-[0_8px_16px_-10px_rgba(190,95,107,0.95)] hover:brightness-[1.04]"
                            >
                                AI로 태스크 생성
                            </button>
                            <button
                                type="button"
                                className="btn w-full rounded-[10px] bg-[#97cca1] text-[13px] text-white shadow-[0_8px_16px_-10px_rgba(151,204,161,0.95)] hover:brightness-[1.04]"
                            >
                                수동 태스크 생성
                            </button>
                        </div>
                    </section>

                    {/* 우측: 뷰 블록 — 하나의 카드 안에 9x9 그리드 · 저장 경고 · 뷰 전환 · 사이드 패널 */}
                    <div className="card grid grid-cols-[1fr_360px] items-start gap-x-6 gap-y-2 p-5">
                        {/* 저장 경고 · 뷰 전환 (사이드 컬럼 상단) */}
                        <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-1">
                            <p className="m-0 whitespace-nowrap text-[11.5px] font-bold text-[#dc3424]">한 번 저장하면 목표를 수정할 수 없어요!</p>
                        </div>

                        {/* ---------- 2D 뷰 ---------- */}

                        <section
                            aria-labelledby="view-2d"
                            className="col-start-1 row-start-1 row-span-2"
                        >
                            <div className="mb-3.5 flex items-center justify-between gap-3">
                                <h2 id="view-2d" className="section-title m-0 text-sm">
                                    2D 뷰 (태스크)
                                </h2>
                                <p className="m-0 text-[11.5px] text-ink-400">칸을 클릭해 과제를 채워보세요</p>
                            </div>

                            {/* 9x9 태스크 그리드 = 3x3 블록 9개 (바깥 grid) × 각 블록의 3x3 칸 (안쪽 grid) */}
                            <ul
                                className="mx-auto my-0 grid w-full max-w-[500px] list-none grid-cols-3 gap-2 p-0 self-start"
                                aria-label="만다라트 9x9 태스크 그리드"
                            >
                                {derivedGrid.map((block, b) => (
                                    <li key={b} className="list-none">
                                        <ul className="m-0 grid list-none grid-cols-3 gap-1 p-0">
                                            {block.map((cell, c) => (
                                                <li key={c} className="aspect-square">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelected2d(`${b}-${c}`)}
                                                        onDoubleClick={() => openTaskModal(b, c)}
                                                        aria-pressed={selected2d === `${b}-${c}`}
                                                        className={`Sheet h-full w-full cursor-pointer break-keep px-[2px] text-[8.5px] leading-[1.15] ${getCellColor(b, c)} ${selected2d === `${b}-${c}` ? 'outline outline-2 outline-mint-700' : ''}`}
                                                    >
                                                        <span>{formatText(cell.task)}</span>
                                                        {'done' in cell && cell.done && (
                                                            <span className="absolute right-[3px] top-[2px] text-[7px]">✓</span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </section>


                        {/* ---------- 2D 뷰: 사이드 패널(미니 그리드 + 과제 리스트) ---------- */}

                        <div className="col-start-2 row-start-2 flex flex-col gap-3">
                            {/* 선택된 '식단' 3x3 미니 그리드 */}
                            <section
                                aria-labelledby="mini-3x3"
                                className="card rounded-2xl border-[3px] border-[#e9f6e8] bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                            >
                                <ul className="mgrid m-0 list-none grid-cols-3 gap-[5px] p-0">
                                    {currentMiniGrid.map((cell, i) => (
                                        <li
                                            key={i}
                                            className={`cell break-keep text-[13px] font-bold ${getCellColor(selectedBlockIndex, i)}`}
                                        >
                                            {formatText(cell.task)}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* 추가할 수 있는 과제 */}
                            <section
                                aria-labelledby="addable-2d"
                                className="card rounded-2xl border-[3px] border-[#e9f6e8] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                            >
                                <h3 id="addable-2d" className="section-title m-0 mb-3 text-[13.5px]">
                                    추가할 수 있는 과제
                                </h3>

                                <div className="mb-4 flex flex-col gap-1">
                                    <label htmlFor="task-search" className="text-xs font-bold text-ink-500">
                                        과제 검색
                                    </label>
                                    <input
                                        id="task-search"
                                        type="text"
                                        placeholder="추가할 과제 검색"
                                        className="w-full rounded-lg border border-ink-300 bg-[#f8fafc] px-3 py-[10px] text-xs text-ink-700 outline-none focus:border-mint-400"
                                    />
                                </div>

                                <ul className="m-0 mb-5 flex list-none flex-col gap-2 p-0">
                                    {TaskRecommend.map((t) => (
                                        <li
                                            key={t.title}
                                            className="card card-hover flex items-center gap-2.5 rounded-xl border border-[#e2e8f0] p-3 shadow-none"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-300 text-sm">
                                                {t.emoji}
                                            </span>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate text-xs font-bold text-ink-900">
                                                    {t.title}
                                                </span>
                                                <span className="mt-[2px] text-[10.5px] text-ink-400">
                                                    {t.domain_name}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAddRecommendTask(t)}
                                                className="btn ml-auto shrink-0 rounded-md bg-mint-500 px-3 py-[3px] text-[11px] font-bold text-white"
                                            >
                                                + 추가
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <nav
                                    className="pagination flex w-full justify-center gap-1.5 text-[13px]"
                                    aria-label="과제 페이지네이션"
                                >
                                    {PAGES.map((p, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() =>
                                                p !== "‹" && p !== "›" && setPage2d(p)
                                            }
                                            aria-current={page2d === p ? "page" : undefined}
                                            className={`page-btn h-7 w-7 rounded-lg ${page2d === p ? "active" : ""}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </nav>
                            </section>
                        </div>



                    </div>
                </div>
            </main>

            {/* 저장 확인 팝업 */}
            {saveOpen && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm transition-all"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="save-title"
                >
                    {taskNum < 81 ? (
                        <div className="flex w-[380px] flex-col items-center gap-5 rounded-[24px] bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#b85b56] text-3xl">
                                ⚠️
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 id="save-title" className="m-0 text-lg font-extrabold text-ink-900">
                                    만다라트를 다 채우지 못했습니다
                                </h2>
                                <p className="m-0 text-[14px] leading-relaxed text-ink-500">
                                    작성하지 않은 빈칸이 있습니다.
                                    <br />
                                    만다라트는 모든 칸을 채워야만 생성이 가능합니다.
                                    <br />
                                    빈칸을 모두 채운 후 다시 시도해주세요.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSaveOpen(false)}
                                className="btn w-full rounded-xl bg-[#b85b56] text-[15px] text-white hover:brightness-[1.15]"
                            >
                                돌아가서 마저 채우기
                            </button>
                        </div>
                    ) : (
                        <div className="flex w-[380px] flex-col items-center gap-5 rounded-[24px] bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#858ae3] text-3xl">
                                ❓
                            </div>
                            <div className="flex flex-col gap-2">
                                <h2 id="save-title" className="m-0 text-lg font-extrabold text-ink-900">
                                    정말 생성하시겠습니까?
                                </h2>
                                <p className="m-0 text-[14px] leading-relaxed text-ink-500">
                                    한번 수정된 만다라트의 내용은 추후에 <b className="text-ink-900">수정할 수 없습니다.</b>
                                    <br />
                                    이대로 생성하시겠습니까?
                                </p>
                            </div>
                            <div className="flex w-full gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSaveOpen(false)}
                                    className="btn flex-1 rounded-xl border border-[#cbd5e1] bg-white text-[15px] font-bold text-ink-500 hover:bg-[#f4f5f9]"
                                >
                                    계속 편집하기
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { /* 생성 로직 연결 */ setSaveOpen(false); }}
                                    className="btn flex-1 rounded-xl border-0 bg-[#858ae3] text-[15px] text-white hover:brightness-[1.15]"
                                >
                                    생성하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 취소 확인 팝업 */}
            {cancelOpen && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm transition-all"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cancel-title"
                >
                    <div className="flex w-[380px] flex-col items-center gap-5 rounded-[24px] bg-white p-8 text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#b85b56] text-3xl">
                            ⚠️
                        </div>
                        <div className="flex flex-col gap-2">
                            <h2 id="cancel-title" className="m-0 text-lg font-extrabold text-ink-900">
                                정말 취소하시겠습니까?
                            </h2>
                            <p className="m-0 text-[14px] leading-relaxed text-ink-500">
                                저장되지 않은 내용은 모두 삭제됩니다.
                                <br />
                                그래도 나가시겠습니까?
                            </p>
                        </div>
                        <div className="flex w-full gap-3">
                            <Link
                                to="#"
                                className="btn flex-1 rounded-xl border border-[#cbd5e1] bg-white text-[15px] font-bold text-ink-500 hover:bg-[#f4f5f9]"
                            >
                                나가기
                            </Link>
                            <button
                                type="button"
                                onClick={() => setCancelOpen(false)}
                                className="btn flex-1 rounded-xl bg-[#b85b56] text-[15px] text-white hover:brightness-[1.15]"
                            >
                                계속 편집하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* 태스크 설정 팝업 */}
            {taskModalOpen && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm transition-all"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex w-[400px] flex-col gap-5 rounded-[24px] bg-white p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] text-left">
                        <div>
                            <h2 className="m-0 text-xl font-extrabold text-ink-900 mb-2">태스크 설정</h2>
                            <span className="inline-block rounded-full bg-[#e8dcbd] px-3 py-1 text-xs font-bold text-ink-900">
                                {modalTaskData.domain}
                            </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-bold text-ink-900">목표 태스크</label>
                            <input
                                type="text"
                                value={modalTaskData.task || ""}
                                onChange={(e) => setModalTaskData((prev: any) => ({ ...prev, task: e.target.value }))}
                                className="w-full rounded-xl border border-[#e7eaee] p-3 text-[14px] font-semibold text-ink-900 outline-none focus:border-[#97cca1]"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-ink-900">마감 기한</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalTaskData((prev: any) => ({ ...prev, deadlineType: 'daily' }))}
                                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${modalTaskData.deadlineType === 'daily' ? 'bg-[#97cca1] text-white shadow-sm border-0' : 'border border-[#e7eaee] text-ink-400 bg-white'}`}
                                >
                                    일간
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalTaskData((prev: any) => ({ ...prev, deadlineType: 'weekly' }))}
                                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${modalTaskData.deadlineType === 'weekly' ? 'bg-[#97cca1] text-white shadow-sm border-0' : 'border border-[#e7eaee] text-ink-400 bg-white'}`}
                                >
                                    주간
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalTaskData((prev: any) => ({ ...prev, deadlineType: 'none' }))}
                                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${modalTaskData.deadlineType === 'none' ? 'bg-[#97cca1] text-white shadow-sm border-0' : 'border border-[#e7eaee] text-ink-400 bg-white'}`}
                                >
                                    없음
                                </button>
                            </div>

                        </div>



                        <div className="flex flex-col gap-1.5">
                            <label className={`text-[13px] font-bold transition-colors ${'text-ink-900'}`}>목표 횟수</label>
                            <input
                                type="number"
                                disabled
                                value={cntChecker(modalTaskData.deadlineType || 'none')}
                                className="w-full rounded-xl border border-[#e7eaee] p-3 text-[14px] font-semibold outline-none transition-colors bg-[#f4f5f9] text-ink-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="mt-2 flex w-full gap-3">
                            <button
                                type="button"
                                onClick={() => setTaskModalOpen(false)}
                                className="btn flex-1 rounded-xl border border-[#e7eaee] bg-white text-[15px] font-bold text-ink-400 hover:bg-[#f4f5f9]"
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleModalSave();
                                    setTaskModalOpen(false);
                                }}
                                className="btn flex-1 rounded-xl bg-[#97cca1] text-[15px] font-bold text-white shadow-[0_8px_16px_-8px_rgba(151,204,161,0.6)] hover:brightness-[1.05]"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
