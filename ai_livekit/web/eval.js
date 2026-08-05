/*
 * 프롬프트 평가 화면.
 *
 * **계산은 하나도 하지 않습니다.** 정확도·신뢰구간·혼동 행렬은 전부 `evals/runner.py`
 * 가 냅니다. 여기서 한 번 더 계산하면 CLI 와 화면이 다른 숫자를 말하는 날이 오고,
 * 그때 어느 쪽이 맞는지 알 방법이 없습니다. 이 파일은 받은 것을 그리기만 합니다.
 *
 * 폴링으로 진행률을 받습니다 — 평가 한 번이 수십 초라 요청 하나로 붙들면 브라우저가
 * 먼저 끊습니다.
 */

const $ = (id) => document.getElementById(id);

const pct = (x) => `${(x * 100).toFixed(1)}%`;
const esc = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let report = null;
let runId = null;
let filter = 'all';

/**
 * "무엇이 실패인가" 의 정의는 **러너에만** 있습니다(`PICKS`). 화면은 어느 기준을 쓸지
 * 이름으로만 보내고, 케이스를 고르는 일은 서버가 합니다 — 여기서 id 목록을 만들면
 * 정의가 두 곳이 되고, 한쪽만 고치는 날 화면과 CLI 가 다른 것을 돌립니다.
 */
const picks = () =>
  [...$('picks').children]
    .filter((c) => c.getAttribute('aria-pressed') === 'true')
    .map((c) => c.dataset.pick);

/* ── 실행 ─────────────────────────────────────────────── */

async function run(options) {
  const buttons = [$('run'), $('rerun'), $('ab-run')];
  buttons.forEach((b) => (b.disabled = true));
  $('stop').hidden = false;
  $('stop').disabled = false;
  $('stop').textContent = '중지';
  $('run-error').innerHTML = '';
  $('report').hidden = true;
  $('progress').classList.add('on');
  $('bar').style.width = '0%';
  $('progress-text').textContent = '시작하는 중…';

  try {
    const started = await fetch('/api/eval/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt_dir: $('prompt-dir').value.trim() || 'prompts',
        provider: $('provider').value || null,
        repeat: Number($('repeat').value),
        ...options,
      }),
    }).then((r) => r.json());

    if (started.error) throw new Error(started.error);
    runId = started.id;
    await poll(started.id);
  } catch (err) {
    fail(err.message);
  } finally {
    buttons.forEach((b) => (b.disabled = false));
    $('stop').hidden = true;
  }
}

/**
 * 중지. **깃발만 세우고 기다립니다** — 러너가 케이스 경계와 백오프 대기 중에 봅니다.
 * 이미 나간 요청은 끝까지 가므로 즉시 멈추지는 않고, 그때까지 돈 것은 결과로 남습니다.
 */
async function stop() {
  if (!runId) return;
  $('stop').disabled = true;
  $('stop').textContent = '중지하는 중…';
  $('progress-text').textContent = '중지 요청됨 — 진행 중인 케이스를 마치는 중…';
  try {
    await fetch(`/api/eval/stop?id=${runId}`, { method: 'POST' });
  } catch {
    /* 폴링이 어차피 끝을 알려줍니다 */
  }
}

function rerun() {
  const pick = picks();
  if (!pick.length) {
    fail('다시 돌릴 기준을 하나 이상 고르세요');
    return;
  }
  if (!runId) {
    fail('먼저 한 번 돌려야 재실행할 기준이 생깁니다');
    return;
  }
  run({ rerun_of: runId, pick, repeat: Number($('rerun-repeat').value) });
}

async function poll(id) {
  for (;;) {
    const state = await fetch(`/api/eval/status?id=${id}`).then((r) => r.json());

    if (state.total) {
      const ratio = state.done / state.total;
      $('bar').style.width = `${ratio * 100}%`;
      // A/B 는 어느 팔이 도는지 같이 씁니다 — 진행률만 보면 40/80 이 A 의 끝인지
      // B 의 시작인지 알 수 없습니다.
      $('progress-text').textContent =
        (state.arm ? `${state.arm}  ·  ` : '') +
        `${state.done} / ${state.total}  ·  ${state.current ?? ''}`;
    }

    if (state.finished) {
      $('progress').classList.remove('on');
      if (state.error) {
        fail(state.error, state.trace);
        return;
      }
      // A/B 는 비교표를 위 카드에, 팔 하나의 리포트를 아래에 그립니다.
      if (state.ab) {
        renderAb(state.ab, state.arms);
        // 방금 것을 목록 맨 위에 얹고 골라 둡니다. **카드는 다시 그리지 않습니다** —
        // 다시 받으면 `arms`(팔 리포트로 들어가는 길)가 사라집니다.
        refreshPicker(state.ab.name);
      }
      if (state.ab_note) abNote(state.ab_note);
      report = state.report;
      render();
      return;
    }
    await new Promise((r) => setTimeout(r, 400));
  }
}

function fail(message, trace) {
  $('progress').classList.remove('on');
  $('run-error').innerHTML =
    `<div class="error"><b>실행 실패</b><br>${esc(message)}` +
    (trace ? `<pre>${esc(trace)}</pre>` : '') +
    '</div>';
}

/* ── 그리기 ───────────────────────────────────────────── */

/**
 * 지표 타일. **점추정만 크게 쓰고 끝내지 않습니다** — 구간을 숫자와 막대로 같이
 * 보여 줍니다. 38건짜리 셋에서 82%와 87%는 구간이 거의 겹쳐서, 점추정만 보면
 * 없는 개선을 봤다고 믿게 됩니다.
 */
function tile(label, r) {
  if (!r || !r.n) return `<div class="tile"><div class="k">${label}</div><div class="v">—</div></div>`;
  const width = (r.hi - r.lo) * 100;
  return `
    <div class="tile">
      <div class="k">${label}</div>
      <div class="v">${pct(r.p)}</div>
      <div class="ci">[${pct(r.lo)}, ${pct(r.hi)}]  ${r.k}/${r.n}</div>
      <div class="ci-bar">
        <i style="left:${r.lo * 100}%;width:${width}%"></i>
        <b style="left:${r.p * 100}%"></b>
      </div>
    </div>`;
}

function plain(label, value, hint) {
  return `
    <div class="tile">
      <div class="k">${label}</div>
      <div class="v">${esc(value)}</div>
      ${hint ? `<div class="ci">${esc(hint)}</div>` : ''}
    </div>`;
}

function render() {
  const s = report.summary;
  const m = report.meta;

  $('tiles').innerHTML = [
    tile('intent 정확도', s.intent_accuracy),
    tile('action 정확도 (엄격)', s.action_accuracy),
    tile('action (허용집합)', s.action_accuracy_lenient),
    tile('domain 정확도', s.domain_accuracy),
    tile('frequency 정확도', s.frequency_accuracy),
    tile('count 정확도', s.count_accuracy),
    tile('안전 recall', s.safety_recall),
    tile('출력 정상률', s.clean_rate),
    plain('과차단', `${s.over_block.k}/${s.over_block.n}`, '정상 발화를 harmful·self_harm 으로'),
    plain('자기일관성', pct(s.consistency_mean),
      m.repeat > 1 ? `흔들린 항목 ${s.unstable.length}건` : '반복 1회 — 측정 안 됨'),
  ].join('');

  renderPartial(m, s);
  renderMeasurement(s.measurement);
  renderDefects(s);

  $('rerun-count').textContent = '';

  const strictN = s.intent_accuracy.n;
  $('ci-note').innerHTML =
    `엄격 지표는 모호 라벨(<code>ambiguous</code>)을 뺀 ${strictN}건 기준입니다. ` +
    `<b>구간이 넓으면 그건 프롬프트가 아니라 셋이 작다는 뜻입니다</b> — ` +
    `100~150건까지 늘려야 5%p 차이가 보입니다.` +
    (m.repeat === 1
      ? ' 자기일관성은 반복 1회라 측정되지 않았습니다(항상 100%).'
      : '');

  renderMatrix(s.confusion);

  const t = s.tokens;
  $('ops').innerHTML = [
    plain('prompt 토큰', t.prompt.sum.toLocaleString(), `평균 ${t.prompt.mean.toLocaleString()}/호출`),
    plain('output 토큰', t.output.sum.toLocaleString(), `평균 ${t.output.mean.toLocaleString()}/호출`),
    plain('캐시된 토큰', t.cached.sum.toLocaleString(),
      t.cached.sum === 0 ? '한 번도 안 걸림' : `전체의 ${pct(t.cached.sum / (t.prompt.sum || 1))}`),
    plain('지연 p50', `${s.latency_ms.p50}ms`, `p95 ${s.latency_ms.p95}ms`),
    plain('위반 (서버가 막음)',
      Object.values(s.violations).reduce((a, b) => a + b, 0),
      Object.entries(s.violations).map(([k, v]) => `${k} ${v}`).join(' · ') || '없음'),
    plain('실패한 호출', s.errors.length, s.errors[0]?.error?.slice(0, 40) ?? ''),
  ].join('');

  renderCases();

  $('meta').textContent =
    `${m.prompt_dir} · ${m.provider} · classify=${m.classify_model} · decide=${m.decide_model}` +
    ` · ${m.repeat}회 · ${s.runs}런 · ${m.elapsed_s}초`;

  $('report').hidden = false;
}

/**
 * 부분 실행 경고 — 골라 돌렸거나(재실행) 돌다 말았을 때(중지).
 *
 * **비율보다 위에 둡니다.** 실패만 모아 돌리면 정확도가 낮은 게 당연한데, 그 숫자를
 * 프롬프트 성적으로 읽으면 없는 퇴보를 봅니다. 재실행 리포트는 판정용이 아니라
 * 분류용입니다 — 어느 실패가 진짜인지 가르는 도구입니다.
 */
function renderPartial(m, s) {
  const box = $('partial');
  const notes = [];
  if (m.subset) {
    notes.push(
      `<b>부분 재실행 — 전체 ${m.subset.of}건 중 ${m.subset.picked}건</b> ` +
      `(${m.subset.pick.map(esc).join(' / ')})`);
  }
  if (m.stopped) {
    notes.push(`<b>중지됨 — 예정 ${m.planned_cases}건 중 ${s.cases}건만 돌았습니다</b>`);
  }
  box.innerHTML = notes.length
    ? `<div class="warn-box">${notes.join('<br>')}<br>` +
      `아래 비율은 <b>전체 정확도가 아닙니다.</b> 판정은 전체 실행으로 하세요.</div>`
    : '';
}

/**
 * 출력 오염 경고 — **아무도 막지 못하고 사용자에게 나간 것들.**
 *
 * `위반` 타일과 다릅니다. 그쪽은 서버가 잡아 되묻기로 돌린 것이고, 이쪽은 스키마도
 * 통과하고 잘리지도 않아 말풍선까지 간 것입니다. `action` 만 맞으면 골든셋은 정답으로
 * 세므로, 이 경고가 없으면 깨진 응답이 만점으로 보고됩니다.
 */
function renderDefects(s) {
  const box = $('defects');
  const ids = s.dirty_cases || [];
  if (!ids.length) {
    box.innerHTML = '';
    return;
  }
  const kinds = Object.entries(s.output_defects)
    .map(([k, v]) => `<code>${esc(k)}</code> ${v}`).join(' · ');
  box.innerHTML =
    `<div class="error">` +
    `<b>출력 오염 ${ids.length}건 — 사용자에게 그대로 나갑니다</b><br>` +
    `${kinds}<br>` +
    `<code>${ids.map(esc).join(', ')}</code><br>` +
    `이 케이스들은 <b>action 이 맞아 "통과" 로 집계됩니다.</b> 정확도가 아니라 ` +
    `위의 <b>출력 정상률</b>을 보세요.` +
    `</div>`;
}

/**
 * 측정 실패 경고. **정확도 타일 위**에 놓습니다.
 *
 * 429 로 못 잰 런은 오답이 아니라 표본에서 빠집니다(러너가 그렇게 셉니다). 그러면
 * 위의 비율들이 더 작은 n 에서 나온 값이 되는데, 그 사실을 안 알리면 넓어진 신뢰구간을
 * "프롬프트가 불안정하다" 로 읽게 됩니다 — 원인은 한도입니다.
 */
function renderMeasurement(m) {
  const box = $('measurement');
  if (!m || !m.failed_runs) {
    box.innerHTML = '';
    return;
  }
  const cases = m.unmeasured_cases.length
    ? ` 한 번도 못 잰 케이스: <code>${m.unmeasured_cases.map(esc).join(', ')}</code>.`
    : '';
  box.innerHTML =
    `<div class="warn-box">` +
    `<b>측정 실패 ${m.failed_runs}/${m.total_runs}런 (${pct(m.rate)})</b><br>` +
    `아래 비율은 이만큼 <b>작은 표본</b>에서 나온 값입니다 — 오답으로 세지 않았습니다.` +
    `${cases} 429 가 원인이면 프롬프트가 아니라 API 한도를 봐야 합니다.` +
    `</div>`;
}

function renderMatrix(confusion) {
  const rows = Object.keys(confusion);
  const cols = [...new Set(rows.concat(...rows.map((r) => Object.keys(confusion[r]))))];

  const head = `<tr><th>기대 \\ 실제</th>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}<th>합계</th></tr>`;
  const body = rows.map((r) => {
    const total = Object.values(confusion[r]).reduce((a, b) => a + b, 0);
    const cells = cols.map((c) => {
      const n = confusion[r][c] || 0;
      const cls = n === 0 ? 'zero' : r === c ? 'diag' : 'off';
      return `<td class="${cls}">${n}</td>`;
    }).join('');
    return `<tr><th>${esc(r)}</th>${cells}<td>${total}</td></tr>`;
  }).join('');

  $('matrix').innerHTML = head + body;
}

/*
 * 판정(`통과`/`실패`/`미측정`)은 **러너가 내려보냅니다**(`verdict_of`). 여기서 다시
 * 계산하지 않습니다 — 예전에 `intent_ok !== false && action_ok !== false` 로 재던 때,
 * 미측정은 두 값이 `null` 이라 그 식이 참이 되어 **한 번도 못 잰 케이스가 "통과" 로
 * 그려졌습니다.** 계산을 한 곳에 두면 그 실수를 다시 할 수 없습니다.
 */
const MARK = { 통과: 'pass', 실패: 'fail', 미측정: 'dead' };

const flipped = (r) => r.before && r.before.verdict !== r.verdict;

function renderCases() {
  const rows = report.results.filter((r) => {
    if (filter === 'fail') return r.verdict === '실패';
    if (filter === 'unmeasured') return r.verdict === '미측정';
    if (filter === 'dirty') return r.clean === false;
    if (filter === 'unstable') return r.measured && r.consistency < 1;
    if (filter === 'ambiguous') return r.ambiguous;
    if (filter === 'flipped') return flipped(r);
    return true;
  });

  if (!rows.length) {
    $('cases').innerHTML = '<p class="empty">해당하는 케이스가 없습니다.</p>';
    return;
  }

  $('cases').innerHTML = rows.map((r) => {
    // 모호 라벨이어도 **미측정은 미측정으로** 보여 줍니다. "모호" 로 덮으면 못 잰
    // 것이 라벨 문제로 읽혀서, API 를 봐야 할 때 골든셋을 들여다보게 됩니다.
    const mark =
      r.verdict === '미측정'
        ? '<span class="mark dead">미측정</span>'
        : r.ambiguous
          ? '<span class="mark amb">모호</span>'
          : `<span class="mark ${MARK[r.verdict]}">${esc(r.verdict)}</span>`;

    const row = (label, want, got, missed) => `
      <div>${label}</div>
      <div class="${missed ? 'miss' : ''}">
        기대 <code>${esc(want)}</code> · 실제 <code>${esc(got ?? '—')}</code>
      </div>`;

    return `
      <div class="case">
        <div class="case-head">
          <span class="case-id">${esc(r.id)}</span>
          <span class="case-utt">${esc(r.utterance)}</span>
          ${r.before
            ? `<span class="mark ${flipped(r) ? 'flip' : 'same'}">` +
              `${esc(r.before.verdict)} → ${esc(r.verdict)}</span>`
            : ''}
          ${r.clean === false
            ? `<span class="mark dirty">출력 오염 ${esc(r.defects.join(' '))}</span>` : ''}
          ${r.measured && r.consistency < 1
            ? `<span class="mark amb">흔들림 ${pct(r.consistency)}</span>` : ''}
          ${mark}
        </div>
        <div class="case-detail">
          ${row('intent', r.expect.intent.join(' | '), r.intent, r.intent_ok === false)}
          ${row('action', r.expect.action.join(' | '), r.action, r.action_ok === false)}
          ${r.expect.domain ? row('domain', r.expect.domain, r.runs[0]?.domain, r.domain_ok === false) : ''}
          <div>근거</div><div class="note">${esc(r.note)}</div>
          ${r.runs[0]?.reply ? `<div>응답</div><div>${esc(r.runs[0].reply.slice(0, 160))}</div>` : ''}
          ${r.runs[0]?.error ? `<div>오류</div><div class="miss"><code>${esc(r.runs[0].error)}</code></div>` : ''}
        </div>
      </div>`;
  }).join('');
}

/* ── A/B 비교 ─────────────────────────────────────────── */

/*
 * **여기도 계산을 하지 않습니다.** 델타·p-value·갈린 쌍·판정은 전부 `compare()` 가
 * 냅니다(`evals/runner.py`). 화면이 다시 세면 CLI(`--vs`)와 이 페이지가 서로 다른
 * 판정을 말하는 날이 오고, 그때 어느 쪽이 맞는지 알 방법이 없습니다.
 *
 * 페이지를 열면 `GET /api/eval/ab` 로 **가장 최근 기록**을 받아 그립니다 — A/B 한 번이
 * 몇 분씩 걸려서, 어제 돌린 것을 오늘 다시 보려고 이 화면을 엽니다.
 */

const AB_MARK = { 개선: 'pass', 퇴보: 'fail', '판정 불가': 'dead', 동일: 'same' };

/** 차이는 **퍼센트포인트**입니다 — 82%→87% 는 `+5.0%p` 이지 `+6%` 가 아닙니다. */
const signed = (x) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${(Math.abs(x) * 100).toFixed(1)}%p`;

const when = (seconds) =>
  new Date(seconds * 1000).toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/** 목록에서만 초까지 씁니다 — 같은 분에 두 건이 있으면 분 단위로는 구분이 안 됩니다. */
const whenExact = (seconds) =>
  new Date(seconds * 1000).toLocaleString('ko-KR', {
    month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

const armLine = (side, arm) =>
  `${side} <code>${esc(arm.prompt_dir)}</code> · ${esc(arm.provider)}` +
  ` · classify=${esc(arm.classify_model)} · decide=${esc(arm.decide_model)}` +
  ` · ${arm.repeat}회 · ${arm.cases}건 · ${arm.elapsed_s}초`;

function abMetricRow(m, primary) {
  const isPrimary = m.name === primary;
  const label = esc(m.label) + (isPrimary ? ' <span class="mark same">주 지표</span>' : '');
  if (!m.a.n) {
    return `<tr><th>${label}</th><td colspan="6" class="zero">측정된 짝이 없습니다</td></tr>`;
  }
  const d = m.discordant;
  const cell = (r) =>
    `${pct(r.p)}<div class="ci">[${pct(r.lo)}, ${pct(r.hi)}] ${r.k}/${r.n}</div>`;
  return `
    <tr class="${isPrimary ? 'primary' : ''}">
      <th>${label}</th>
      <td>${cell(m.a)}</td>
      <td>${cell(m.b)}</td>
      <td class="${m.delta > 0 ? 'up' : m.delta < 0 ? 'down' : ''}">${signed(m.delta)}</td>
      <td>${d.b_wins} : ${d.a_wins}
        <div class="ci">${m.win_share
          ? `B 우세 [${pct(m.win_share.lo)}, ${pct(m.win_share.hi)}]`
          : '갈린 것 없음'}</div></td>
      <td>${m.p_value.toFixed(3)}</td>
      <td><span class="mark ${AB_MARK[m.verdict] ?? 'same'}">${esc(m.verdict)}</span></td>
    </tr>`;
}

/**
 * 표보다 **위에** 놓는 경고들. 아래를 읽고 나서 "그런데 모델이 달랐다" 를 보면 이미
 * 결론을 낸 뒤입니다.
 */
function abWarnings(c) {
  const notes = [];
  if (c.null_test) {
    notes.push(
      `<b>같은 폴더끼리 비교(A/A)</b> — 이 표는 프롬프트 차이가 아니라 ` +
      `<b>잡음의 크기</b>입니다. 유의한 칸이 나오면 그 지표는 이 셋으로 잴 수 없다는 뜻입니다.`);
  }
  if (c.confounds.length) {
    notes.push(
      `<b>프롬프트 말고 ${c.confounds.map(esc).join(', ')} 도 다릅니다</b> — ` +
      `이 표는 프롬프트를 잰 것이 아닙니다.`);
  }
  for (const [side, key] of [['A', 'a_unmeasured'], ['B', 'b_unmeasured']]) {
    const ids = c.measurement[key];
    if (ids.length) {
      notes.push(
        `<b>${side} 가 못 잰 케이스 ${ids.length}건</b> — 짝이 없어 모든 지표에서 ` +
        `빠집니다(오답으로 세지 않았습니다): <code>${ids.map(esc).join(', ')}</code>`);
    }
  }
  if (c.paired.relabelled.length) {
    notes.push(
      `<b>라벨이 달라져 뺀 케이스</b> — 그 사이 골든셋이 편집됐습니다: ` +
      `<code>${c.paired.relabelled.map(esc).join(', ')}</code>`);
  }
  for (const [side, key] of [['A', 'a_only'], ['B', 'b_only']]) {
    const ids = c.paired[key];
    if (ids.length) {
      notes.push(`<b>${side} 에만 있는 케이스</b>: <code>${ids.map(esc).join(', ')}</code>`);
    }
  }
  if (c.arms.a.stopped || c.arms.b.stopped) {
    notes.push('<b>한쪽이 중지됐습니다</b> — 짝지어진 부분만 비교했습니다.');
  }
  return notes.length ? `<div class="warn-box">${notes.join('<br><br>')}</div>` : '';
}

function abFlips(flips) {
  if (!flips.length) {
    return '<p class="hint">판정이 바뀐 케이스가 없습니다 — 두 폴더가 같은 답을 냈습니다.</p>';
  }
  const rows = flips.map((f) => `
    <tr>
      <th>${esc(f.id)}</th>
      <td>
        <span class="mark ${MARK[f.a.verdict]}">${esc(f.a.verdict)}</span>
        →
        <span class="mark ${MARK[f.b.verdict]}">${esc(f.b.verdict)}</span>
      </td>
      <td style="font-family:var(--font-sans)">${esc(f.utterance)}</td>
      <td>${esc(f.a.intent)}→${esc(f.a.action)}</td>
      <td>${esc(f.b.intent)}→${esc(f.b.action)}</td>
    </tr>`).join('');
  return `
    <table class="ab-flips">
      <tr><th>id</th><th>A → B</th><th>발화</th><th>A</th><th>B</th></tr>
      ${rows}
    </table>`;
}

function renderAb(record, arms) {
  const box = $('ab-body');
  if (!record || !record.compare) {
    box.innerHTML =
      '<p class="empty">아직 A/B 기록이 없습니다 — 폴더 둘을 적고 돌리면 여기 남습니다.</p>';
    return;
  }
  const c = record.compare;

  // 팔 하나를 아래 리포트 자리에 띄우는 칩. **방금 돌린 A/B 에만 붙습니다** —
  // 디스크에 남는 기록은 요약뿐이라(런 원문을 버립니다) 케이스를 파고들 수 없습니다.
  const chips = arms
    ? `<div class="filters" id="ab-arms">` +
      Object.entries(arms).map(([side, id]) =>
        `<button class="chip" data-arm="${esc(id)}" aria-pressed="${side === 'b'}">` +
        `${side.toUpperCase()} 리포트 (<code>${esc(c.arms[side].prompt_dir)}</code>)</button>`
      ).join('') +
      `</div>`
    : '';

  box.innerHTML = `
    <div class="ab-head">
      <span class="mark ${AB_MARK[c.verdict] ?? 'same'} big">${esc(c.verdict)}</span>
      <b><code>${esc(c.arms.a.prompt_dir)}</code> → <code>${esc(c.arms.b.prompt_dir)}</code></b>
      <span class="hint" style="margin:0">
        짝지은 케이스 ${c.paired.cases}건 · ${when(record.saved_at)}
      </span>
    </div>
    <p class="meta-line" style="margin-top:0.2rem">
      ${armLine('A', c.arms.a)}<br>${armLine('B', c.arms.b)}
    </p>
    ${abWarnings(c)}
    <div style="overflow-x:auto">
      <table class="ab-table">
        <tr>
          <th>지표</th><th>A</th><th>B</th><th>Δ</th>
          <th>갈린 쌍 (B만 : A만)</th><th>p</th><th>판정</th>
        </tr>
        ${c.metrics.map((m) => abMetricRow(m, c.primary)).join('')}
      </table>
    </div>
    <p class="hint">
      <b>판정은 주 지표 한 칸으로 합니다.</b> 지표 ${c.metrics.length}개를 한꺼번에 보므로,
      두 프롬프트에 차이가 없어도 어느 한 칸이 유의해 보일 확률이
      <b>${pct(c.family_risk)}</b> 입니다 — 나머지 칸은 판정이 아니라 단서로만 보세요.
      <br>
      <b>갈린 쌍</b>이 p 의 전부입니다. 둘 다 맞거나 둘 다 틀린 케이스는 어느 쪽이 나은지에
      대해 아무 말도 하지 않아 검정에 들어가지 않습니다 — 이 골든셋에서는
      <b>한쪽으로 ${c.needed_sweep}건은 갈려야</b> ${pct(c.significance)} 수준에서 유의해집니다.
      갈린 쌍이 그보다 적어서 "판정 불가" 라면 그건 프롬프트가 아니라 <b>표본이 작다는 뜻</b>입니다.
    </p>

    <h2 style="margin-top:1.4rem">판정 바뀐 케이스 ${c.flips.length}건</h2>
    <div style="overflow-x:auto">${abFlips(c.flips)}</div>

    <h2 style="margin-top:1.4rem">비용 · 안정성 <span style="text-transform:none;letter-spacing:0">— 호출당 평균</span></h2>
    <div class="tiles">
      ${plain('prompt 토큰', `${c.cost.prompt_mean.a.toLocaleString()} → ${c.cost.prompt_mean.b.toLocaleString()}`,
        '프롬프트가 길어지면 여기가 먼저 오릅니다')}
      ${plain('output 토큰', `${c.cost.output_mean.a.toLocaleString()} → ${c.cost.output_mean.b.toLocaleString()}`)}
      ${plain('지연 p50', `${c.cost.latency_p50.a} → ${c.cost.latency_p50.b}ms`)}
      ${plain('위반 (서버가 막음)', `${c.cost.violations.a} → ${c.cost.violations.b}`,
        '라벨이 필요 없는 지표입니다')}
      ${plain('흔들린 항목', `${c.cost.unstable.a} → ${c.cost.unstable.b}건`,
        c.arms.b.repeat > 1 ? '' : '반복 1회 — 측정 안 됨')}
    </div>
    ${chips}
  `;

  if (arms) {
    $('ab-arms').addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (chip) showArm(chip);
    });
  }
}

/** 경고만 얹습니다(중지로 비교가 없을 때). 기존 표를 지우지 않습니다. */
function abNote(message) {
  $('ab-body').insertAdjacentHTML('afterbegin', `<div class="warn-box">${esc(message)}</div>`);
}

/**
 * 아래 리포트 자리에 A 또는 B 를 띄웁니다. **`runId` 도 그 팔로 옮깁니다** — 안 옮기면
 * A 를 보면서 "골라서 다시 돌리기" 를 누를 때 B 의 실패 목록이 돌아갑니다.
 */
async function showArm(chip) {
  const id = chip.dataset.arm;
  const state = await fetch(`/api/eval/status?id=${id}`).then((r) => r.json());
  if (!state.report) return;
  [...chip.parentElement.children].forEach((c) =>
    c.setAttribute('aria-pressed', String(c === chip)));
  runId = id;
  report = state.report;
  render();
}

function runAb() {
  const a = $('ab-a').value.trim();
  const b = $('ab-b').value.trim();
  if (!a || !b) {
    fail('A/B 는 두 프롬프트 폴더를 다 적어야 합니다');
    return;
  }
  run({ mode: 'ab', prompt_dir: a, prompt_dir_b: b, repeat: Number($('ab-repeat').value) });
}

/**
 * 지난 기록 목록. **LLM 을 부르지 않습니다** — 파일을 읽는 것뿐입니다.
 *
 * 목록에는 요약만 옵니다(언제 · 무엇을 무엇과 · 판정). 고른 기록의 본문은 그때 따로
 * 받습니다 — 20건을 통째로 내려받으면 열 때마다 200KB 가 오는데, 그중 보는 것은 한
 * 건입니다.
 */
function renderPicker(history, selected) {
  const row = $('ab-history-row');
  row.hidden = history.length === 0;
  if (!history.length) return;

  $('ab-pick').innerHTML = history.map((h) => {
    // 같은 초에 저장된 기록만 파일명 끝의 일련번호를 덧붙입니다. 초까지 같은 두 건은
    // 시각으로 구분할 수 없어서 목록에 똑같은 줄이 두 개 보입니다 — 실모델로는 A/B
    // 하나가 몇 분이라 닿지 않지만, `--provider echo` 로 연달아 돌리면 실제로 그렇습니다.
    const serial = Number((h.name.match(/-(\d+)\.json$/) || [])[1] ?? 0);
    const label = h.broken
      ? `${esc(h.name)} — 읽을 수 없음`
      : `${whenExact(h.saved_at)}${serial ? ` #${serial}` : ''}` +
        ` · ${esc(h.a)} → ${esc(h.b)} · ${esc(h.verdict)}` +
        `${h.null_test ? ' (A/A)' : ''} · ${h.repeat}회 ${h.cases}건`;
    return `<option value="${esc(h.name)}" ${h.name === selected ? 'selected' : ''}>${label}</option>`;
  }).join('');

  const kept = history.length;
  $('ab-count').textContent =
    `${kept}건 보관 중 (최근 20건까지) · 여는 데 LLM 호출이 들지 않습니다`;
}

/**
 * 기록을 받아 그립니다. `name` 이 없으면 가장 최근 것.
 *
 * 이 함수는 **호출이 0회인 경로입니다.** 페이지를 열 때와 목록에서 고를 때 둘 다
 * 여기로 옵니다 — 사용자가 실수로 몇백 번의 호출을 태우는 일이 없어야 합니다.
 */
async function loadAb(name) {
  try {
    const query = name ? `?name=${encodeURIComponent(name)}` : '';
    const { record, history } = await fetch(`/api/eval/ab${query}`).then((r) => r.json());
    renderPicker(history ?? [], record?.name);
    renderAb(record, null);
  } catch (err) {
    // 개발 도구입니다. 기록을 못 읽는 것으로 화면 전체를 막지 않습니다.
    $('ab-body').innerHTML = `<p class="empty">A/B 기록을 읽지 못했습니다: ${esc(err.message)}</p>`;
  }
}

/** 목록만 새로 받습니다(방금 돌린 A/B 를 목록에 얹을 때 — 카드는 이미 그려져 있습니다). */
async function refreshPicker(selected) {
  try {
    const { history } = await fetch('/api/eval/ab').then((r) => r.json());
    renderPicker(history ?? [], selected);
  } catch {
    /* 목록이 갱신되지 않아도 방금 결과는 화면에 있습니다 */
  }
}

/* ── 배선 ─────────────────────────────────────────────── */

$('run').addEventListener('click', () => run({}));
$('ab-run').addEventListener('click', runAb);
$('rerun').addEventListener('click', rerun);
$('stop').addEventListener('click', stop);

$('filters').addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  filter = chip.dataset.filter;
  [...$('filters').children].forEach((c) =>
    c.setAttribute('aria-pressed', String(c === chip)));
  if (report) renderCases();
});

// 재실행 기준은 **여러 개 고를 수 있습니다**(토글). 필터와 달리 배타 선택이 아닙니다.
$('picks').addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  chip.setAttribute('aria-pressed', chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
});

// 목록에서 고르기. **`change` 로 받습니다** — 여기서 일어나는 일은 파일 읽기뿐이고
// (LLM 호출 0회) 그래서 확인 버튼을 두지 않습니다.
$('ab-pick').addEventListener('change', (event) => loadAb(event.target.value));

// 열면 바로 가장 최근 A/B 를 그립니다 — 돌리지 않아도 보이는 것이 요점입니다.
loadAb();
