/**
 * 담아둔 실천과제 보드 — 왼쪽 패널의 상태와 렌더링.
 *
 * **저장소는 localStorage 입니다.** 서버에 사용자 DB 가 없어서(과제를 담아둘
 * 곳이 아직 없습니다) 브라우저에 둡니다. 그래서 다른 기기·다른 브라우저에서는
 * 보이지 않고, 시크릿 창을 닫으면 사라집니다. 서버로 옮길 때 갈아끼울 곳은
 * `#load` / `#save` 두 개이고, 그때 `GoalPipeline(task_counts=...)` 에 도메인별
 * 개수를 넘겨주면 프롬프트의 `domain_capacity` 규칙도 같이 살아납니다.
 *
 * `ui.js` 와 달리 이 모듈은 자기 상태를 들고 있습니다. 과제 목록은 화면에만
 * 있는 값이 아니라 새로고침을 넘겨야 하는 데이터라서, 그리기와 같은 곳에 두는
 * 편이 어긋날 여지가 적습니다.
 */

const STORAGE_KEY = 'mandarin.tasks.v1';

/**
 * 실천 빈도. 서버의 `FREQUENCY_LABELS`(app/bot/templates.py)와 **같은 문자열**입니다.
 * 채팅 말풍선과 이 보드에 같은 과제가 다른 이름으로 보이면 안 됩니다.
 *
 * 예전의 `type`(mission/mindset) + `is_recurring` 두 필드를 대체합니다.
 */
const FREQUENCY_LABELS = {
  daily: '일간 · 주 7회',
  weekly: '주간 · 주 1회',
  none: '없음 · 한 번만',
};
const DEFAULT_FREQUENCY = 'none';

/**
 * `type`(mission/mindset) + `isRecurring` 으로 저장된 옛 과제를 빈도로 옮깁니다.
 *
 * 저장소 키를 올려서 통째로 버릴 수도 있지만, 담아둔 과제는 사용자가 직접 만든
 * 것이라 조용히 사라지면 안 됩니다. 반복이던 것은 `daily` 로 봅니다 — 주간이었을
 * 수도 있지만 옛 모델에는 그 구분이 없었고, 화면에서 한 번에 고칠 수 있습니다.
 */
function migrate(task) {
  if (FREQUENCY_LABELS[task.frequency]) return task;
  const { type, isRecurring, ...rest } = task;
  return { ...rest, frequency: isRecurring ? 'daily' : DEFAULT_FREQUENCY };
}

/** 만다라트 9x9 이중 3x3 구조 — 한 도메인은 8칸입니다. `prompts/system.md` 의
 *  `domain_capacity` 규칙과 같은 값이며, 여기서도 막아야 담고 나서야 초과를
 *  아는 일이 없습니다. */
export const DOMAIN_CAPACITY = 8;

/**
 * 시트 하나의 도메인 칸 수. 서버의 `TOTAL_SUBJECT_COUNT = 64.0`(8 도메인 x 8 과제)과
 * 짝이 맞는 값입니다 — 9번째 도메인을 담으면 `POST /api/v1/sheets` 로 넘길 때
 * `position` 을 줄 자리가 없습니다.
 */
export const SHEET_DOMAIN_CAPACITY = 8;

/**
 * `frequency`(이 화면·프롬프트의 어휘) → `SubjectPeriod`(서버 enum).
 *
 * 값이 사실상 같은데 대소문자만 다릅니다. 그래도 매핑을 명시해 두는 이유는, 한쪽에
 * 값을 추가하면 여기가 `undefined` 가 되어 **서버 검증에서 걸리기** 때문입니다 —
 * 조용히 `NONE` 으로 떨어지면 매일 할 일이 한 번짜리로 담깁니다.
 */
const SUBJECT_PERIOD = { daily: 'DAILY', weekly: 'WEEKLY', none: 'NONE' };

const UNKNOWN_DOMAIN = '기타';

export class TaskBoard {
  #tasks = [];
  #els;
  #onNotice;

  /**
   * @param {object} els  #board-list / #board-count / #board-empty
   * @param {(text: string) => void} onNotice 채팅 로그에 남길 알림 (담김·삭제·초과)
   */
  constructor(els, onNotice = () => {}) {
    this.#els = els;
    this.#onNotice = onNotice;
    this.#tasks = this.#load();
    this.render();
  }

  get tasks() {
    return [...this.#tasks];
  }

  /**
   * 이 화면 밖으로 넘길 모양 — 연결 종료 시 이전 페이지로, 나중에는 그대로
   * 서버로 갑니다.
   *
   * 브라우저 안에서만 의미가 있는
   * `id` 는 뺍니다. 받는 쪽이 저장할 값과 그리기 위한 값을 구분하지 못하면,
   * 이모지 같은 게 DB 컬럼으로 굳어버립니다.
   */
  snapshot() {
    return this.#tasks.map((task) => ({
      domain: task.domain,
      domainId: task.domainId ?? null,
      domainIsNew: task.domainIsNew === true,
      title: task.title,
      frequency: task.frequency,
      description: task.description,
      templateId: task.templateId,
      addedAt: task.addedAt,
    }));
  }

  /**
   * `POST /api/v1/sheets` 의 `domains[]` 로 그대로 쓸 수 있는 초안.
   *
   * **과제를 하나씩 추가하는 API 는 없습니다.** 시트는 한 번에 통째로 생성되므로
   * (`SheetCreateRequest`), 이 화면이 하는 일은 대화로 64칸 초안을 모아 넘기는
   * 것입니다. 받는 쪽이 `title` · `isOpen` · `expiredAt` 만 채워 감싸면 됩니다 —
   * 그 셋은 이 화면이 알 수 없는 값입니다.
   *
   * `position` 은 담은 순서대로 **1부터** 붙입니다(`DomainRepository` ·
   * `SubjectRepository` 의 `position: 1~8`). 사용자가 만다라트 격자에서 자리를
   * 직접 고르는 UI 가 생기면 그때 이 값을 그쪽에서 정해야 합니다.
   *
   * 빠지는 값이 둘 있습니다.
   * - `description` — 서버 `SubjectCreateRequest` 에 받을 필드가 없습니다. AI 가
   *   만든 설명은 채팅에만 남고 시트에는 저장되지 않습니다.
   * - `point` · `targetCount` — 서버가 계산합니다(period 와 시트 기간으로).
   *   보내면 `targetCount` 는 그 값이 우선하므로 굳이 넘기지 않습니다.
   */
  sheetDraft() {
    const byDomain = new Map();
    for (const task of this.#tasks) {
      if (!byDomain.has(task.domain)) byDomain.set(task.domain, []);
      byDomain.get(task.domain).push(task);
    }

    return [...byDomain.entries()].map(([title, tasks], domainIndex) => ({
      position: domainIndex + 1,
      title,
      subjects: tasks.map((task, subjectIndex) => ({
        position: subjectIndex + 1,
        title: task.title,
        period: SUBJECT_PERIOD[task.frequency] ?? SUBJECT_PERIOD[DEFAULT_FREQUENCY],
      })),
    }));
  }

  /** 도메인별 점유 수. 서버의 `<existing_domain_tasks>` 와 같은 모양입니다. */
  counts() {
    return this.#tasks.reduce((acc, task) => {
      acc[task.domain] = (acc[task.domain] ?? 0) + 1;
      return acc;
    }, {});
  }

  /**
   * 과제를 담습니다.
   * @returns {{ok: boolean, reason?: 'duplicate'|'full'|'domains-full'}}
   */
  add(task) {
    const domain = task.domain || UNKNOWN_DOMAIN;
    const title = (task.title || '').trim();
    if (!title) return { ok: false, reason: 'duplicate' };

    // 같은 도메인에 같은 제목이 두 번 들어가는 건 대부분 버튼 두 번 누른 것입니다.
    if (this.#tasks.some((t) => t.domain === domain && t.title === title)) {
      this.#onNotice(`"${title}" 은(는) 이미 ${domain} 칸에 담겨 있어요`);
      return { ok: false, reason: 'duplicate' };
    }

    const counts = this.counts();

    // 9번째 도메인은 담을 자리가 없습니다. 시트가 8칸 고정이라
    // (서버 `TOTAL_SUBJECT_COUNT = 64`) `position` 을 줄 수 없습니다.
    if (counts[domain] === undefined && Object.keys(counts).length >= SHEET_DOMAIN_CAPACITY) {
      this.#onNotice(
        `도메인 칸을 ${SHEET_DOMAIN_CAPACITY}개까지만 만들 수 있어요. ` +
          `"${domain}" 대신 이미 있는 칸에 담거나, 쓰지 않는 칸을 비워주세요`,
      );
      return { ok: false, reason: 'domains-full' };
    }

    const used = counts[domain] ?? 0;
    if (used >= DOMAIN_CAPACITY) {
      this.#onNotice(
        `${domain} 칸이 ${DOMAIN_CAPACITY}개로 꽉 찼습니다. 기존 과제를 지운 뒤 다시 담아주세요`,
      );
      return { ok: false, reason: 'full' };
    }

    this.#tasks.push({
      id: this.#newId(),
      domain,
      // 도메인이 시트의 자유 이름이라 이모지·설명이 없습니다(고정 목록 폐지).
      // 대신 이 칸을 새로 만들어야 하는지를 들고 있습니다.
      domainIsNew: task.domainIsNew === true,
      domainId: task.domainId ?? null,
      description: task.description || '',
      title,
      frequency: FREQUENCY_LABELS[task.frequency] ? task.frequency : DEFAULT_FREQUENCY,
      templateId: task.templateId || null,
      addedAt: Date.now(),
    });
    this.#save();
    this.render();
    this.#onNotice(`"${title}" 을(를) ${domain} 칸에 담았습니다 (${used + 1}/${DOMAIN_CAPACITY})`);
    return { ok: true };
  }

  remove(id) {
    const index = this.#tasks.findIndex((t) => t.id === id);
    if (index < 0) return;
    const [removed] = this.#tasks.splice(index, 1);
    this.#save();
    this.render();
    this.#onNotice(`"${removed.title}" 을(를) 보드에서 지웠습니다`);
  }

  // ── 렌더링 ───────────────────────────────────────────────────────────
  render() {
    const list = this.#els.boardList;
    if (!list) return;

    list.replaceChildren();
    this.#els.boardCount.textContent = String(this.#tasks.length);
    this.#els.boardEmpty.hidden = this.#tasks.length > 0;

    // 도메인끼리 묶어서 보여줍니다. 만다라트가 도메인 단위 칸이라, 섞어 놓으면
    // 어느 칸이 얼마나 찼는지가 안 보입니다.
    const groups = new Map();
    for (const task of this.#tasks) {
      if (!groups.has(task.domain)) groups.set(task.domain, []);
      groups.get(task.domain).push(task);
    }

    for (const [domain, tasks] of groups) {
      list.append(this.#renderGroup(domain, tasks));
    }
  }

  #renderGroup(domain, tasks) {
    const group = document.createElement('li');
    group.className = 'board-group';

    const head = document.createElement('div');
    head.className = 'board-group-head';

    const name = document.createElement('span');
    name.className = 'board-domain';
    // 새로 만들 칸이면 표시합니다. 시트에 칸이 하나 늘어나는 건 사용자가
    // 담기 전에 알아야 하는 정보입니다.
    name.textContent = tasks.some((t) => t.domainIsNew) ? `${domain} (새 칸)` : domain;

    const count = document.createElement('span');
    count.className = 'board-domain-count';
    count.textContent = `${tasks.length}/${DOMAIN_CAPACITY}`;

    head.append(name, count);
    group.append(head);

    const items = document.createElement('ul');
    items.className = 'board-items';
    tasks.forEach((task) => items.append(this.#renderTask(task)));
    group.append(items);
    return group;
  }

  #renderTask(task) {
    const li = document.createElement('li');
    li.className = 'board-item';

    const body = document.createElement('div');
    body.className = 'board-item-body';

    const title = document.createElement('span');
    title.className = 'board-item-title';
    title.textContent = task.title;
    if (task.description) title.title = task.description;

    const meta = document.createElement('span');
    meta.className = 'board-item-meta';
    meta.textContent = FREQUENCY_LABELS[task.frequency] ?? FREQUENCY_LABELS[DEFAULT_FREQUENCY];

    body.append(title, meta);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'board-remove';
    remove.textContent = '×';
    remove.title = '이 과제를 지웁니다';
    remove.setAttribute('aria-label', `${task.title} 삭제`);
    remove.addEventListener('click', () => this.remove(task.id));

    li.append(body, remove);
    return li;
  }

  // ── 저장소 ───────────────────────────────────────────────────────────
  #newId() {
    // randomUUID 는 secure context 에서만 있습니다. 파일로 열어보는 경우를
    // 대비해 폴백을 둡니다.
    return crypto.randomUUID?.() ?? `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  #load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((t) => t && t.id && t.title).map(migrate);
    } catch {
      // 저장 형식이 바뀌었거나 저장소가 막힌 경우. 과제 목록 하나 때문에
      // 화면 전체가 안 뜨면 안 됩니다.
      console.warn('[board] 저장된 과제를 읽지 못해 빈 보드로 시작합니다');
      return [];
    }
  }

  #save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#tasks));
    } catch {
      console.warn('[board] 과제를 저장하지 못했습니다 (용량 초과 또는 차단됨)');
    }
  }
}
