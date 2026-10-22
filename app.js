/**
 * VolleyScore - Application Core Logic
 * バレーボール スコア＆スタッツ記録アプリ
 * ヘッダーバーに「保存」「新規試合」「試合一覧」「選手登録」「設定」を配置
 * ＆ 3大タブ構成 ＆ ラリー途中編集機能
 */

(function () {
  'use strict';

  // ==========================================
  // 定数・マスタデータ
  // ==========================================

  const ACTIONS_WIN = [
    { code: 'SP', label: 'SP (スパイク決定)', isKill: true },
    { code: 'SA', label: 'SA (サービスエース)', isKill: true },
    { code: 'BP', label: 'BP (ブロック決定)', isKill: true },
    { code: 'プッシュ', label: 'プッシュ決定', isKill: true },
    { code: 'フェイント', label: 'フェイント決定', isKill: true },
    { code: '相手SM', label: '相手サーブミス', isOppError: true },
    { code: '相手SPM', label: '相手スパイクミス', isOppError: true },
    { code: '相手ミス', label: '相手つなぎ/ミス', isOppError: true },
  ];

  const ACTIONS_LOSS = [
    { code: '相手SP', label: '相手SP決定', isOppKill: true },
    { code: '相手SA', label: '相手エース', isOppKill: true },
    { code: '相手BP', label: '相手ブロック', isOppKill: true },
    { code: 'SPM', label: 'SPM (スパイクミス)', isMistake: true },
    { code: 'SM', label: 'SM (サーブミス)', isMistake: true },
    { code: 'DM', label: 'DM (ディグ/ダイレクトM)', isMistake: true },
    { code: 'つなぎM', label: 'つなぎミス', isMistake: true },
    { code: 'BFM', label: 'BFM (ブロックフォローM)', isMistake: true },
    { code: 'FRM', label: 'FRM (フリーボールM)', isMistake: true },
    { code: 'コンビM', label: 'コンビミス', isMistake: true },
  ];

  const DEFAULT_ROSTER = [
    { id: 'p1', number: 1, name: 'なな' },
    { id: 'p2', number: 2, name: 'まお' },
    { id: 'p3', number: 3, name: 'ちづ' },
    { id: 'p4', number: 4, name: 'りお' },
    { id: 'p5', number: 5, name: 'まど' },
    { id: 'p6', number: 6, name: 'はる' },
    { id: 'p7', number: 7, name: 'かな' },
    { id: 'p8', number: 8, name: 'まりん' },
  ];

  // サンプル試合データ (10/18 vs 上智 ④ 手書きノート完全再現)
  const SAMPLE_MATCH_DATA = {
    id: 'sample_match_sophia_set4',
    date: '10/18',
    opponent: '上智',
    myTeamName: '自チーム',
    currentSetIndex: 3,
    savedAt: 1729219200000,
    sets: [
      { setNumber: 1, firstServe: 'us', startingLineup: ['なな', 'まお', 'ちづ', 'りお', 'はる', 'かな'], events: [] },
      { setNumber: 2, firstServe: 'them', startingLineup: ['なな', 'まお', 'ちづ', 'りお', 'はる', 'かな'], events: [] },
      { setNumber: 3, firstServe: 'us', startingLineup: ['なな', 'まお', 'ちづ', 'りお', 'はる', 'かな'], events: [] },
      {
        setNumber: 4,
        firstServe: 'them',
        startingLineup: ['なな', 'まお', 'ちづ', 'りお', 'はる', 'かな'],
        events: [
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手SM', memo: 'SM' },
          { type: 'rally', winner: 'them', player: 'ちづ', actionCode: 'コンビM', memo: 'コンビM' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'プッシュ', memo: 'ちづプッシュ' },
          { type: 'rally', winner: 'them', player: 'ちづ', actionCode: 'SPM', memo: 'ちづSPM' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SP', memo: 'ちづSP' },
          { type: 'rally', winner: 'them', player: 'ちづ', actionCode: 'DM', memo: 'ちづDM' },
          { type: 'rally', winner: 'them', player: 'ちづ', actionCode: 'SPM', memo: 'ちづSPM' },
          { type: 'rally', winner: 'them', player: 'かな', actionCode: 'DM', memo: 'かなDM(まおつなぎM)' },
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手ミス', memo: 'SPM' },
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手ミス', memo: 'つなぎM' },
          { type: 'rally', winner: 'them', player: 'まりん', actionCode: 'DM', memo: 'まりんDM' },
          { type: 'rally', winner: 'them', player: '相手', actionCode: '相手SP', memo: 'SP' },
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手SM', memo: 'SM' },
          { type: 'rally', winner: 'them', player: 'りお', actionCode: 'BFM', memo: 'BFM' },
          { type: 'rally', winner: 'us', player: 'かな', actionCode: 'SP', memo: 'かなSP' },
          { type: 'rally', winner: 'them', player: 'かな', actionCode: 'SPM', memo: 'かなSPM' },
          { type: 'rally', winner: 'them', player: 'なな', actionCode: 'SPM', memo: 'ななSPM' },
          { type: 'rally', winner: 'them', player: 'かな', actionCode: 'SPM', memo: 'かなSPM' },
          { type: 'rally', winner: 'us', player: 'なな', actionCode: 'SP', memo: 'ななSP' },
          { type: 'rally', winner: 'them', player: 'なな', actionCode: 'SPM', memo: 'ななSPM' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SP', memo: 'ちづSP' },
          { type: 'rally', winner: 'us', player: 'なな', actionCode: 'SP', memo: 'ななSP' },
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手ミス', memo: 'つなぎM' },
          { type: 'rally', winner: 'them', player: '相手', actionCode: '相手SP', memo: 'SP' },
          { type: 'rally', winner: 'them', player: '自チーム', actionCode: 'SPM', memo: 'SPM' },
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手ミス', memo: 'つなぎM' },
          { type: 'rally', winner: 'them', player: 'まお', actionCode: 'つなぎM', memo: 'つなぎM' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SP', memo: 'ちづSP' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SA', memo: 'ちづSA' },
          { type: 'rally', winner: 'them', player: 'はる', actionCode: 'SPM', memo: 'はるSPM' },
          { type: 'sub', outPlayer: 'りお', inPlayer: 'まど', position: 3 },
          { type: 'rally', winner: 'us', player: 'かな', actionCode: 'フェイント', memo: 'かなSP(F)' },
          { type: 'rally', winner: 'us', player: 'かな', actionCode: 'SP', memo: 'かなSP' },
          { type: 'rally', winner: 'us', player: '相手', actionCode: '相手ミス', memo: 'SPM' },
          { type: 'rally', winner: 'them', player: 'まど', actionCode: 'SM', memo: 'まどSM' },
          { type: 'rally', winner: 'us', player: 'なな', actionCode: 'SP', memo: 'ななSP' },
          { type: 'rally', winner: 'us', player: 'なな', actionCode: 'SP', memo: 'ななSP' },
          { type: 'rally', winner: 'us', player: 'かな', actionCode: 'BP', memo: 'かなBP' },
          { type: 'rally', winner: 'them', player: 'はる', actionCode: 'BFM', memo: 'BFM' },
          { type: 'rally', winner: 'us', player: 'かな', actionCode: 'SP', memo: 'かなSP' },
          { type: 'rally', winner: 'them', player: '相手', actionCode: '相手SP', memo: 'SP' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SP', memo: 'ちづSP' },
          { type: 'rally', winner: 'them', player: '相手', actionCode: '相手SP', memo: 'SP' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SP', memo: 'ちづSP' },
          { type: 'rally', winner: 'them', player: 'まお', actionCode: 'FRM', memo: 'まおFRM' },
          { type: 'rally', winner: 'them', player: 'ちづ', actionCode: 'SPM', memo: 'ちづSPM' },
          { type: 'rally', winner: 'us', player: 'ちづ', actionCode: 'SP', memo: 'ちづSP' },
          { type: 'rally', winner: 'us', player: 'かな', actionCode: 'SP', memo: 'かなSP' },
        ]
      }
    ]
  };

  // ==========================================
  // アプリケーション状態 (State)
  // ==========================================
  let appState = {
    roster: [],
    match: null,
    savedMatches: [],
  };

  let currentModalAction = {
    winner: 'us',
    player: '',
    actionCode: '',
    memo: '',
  };

  let editingEventState = {
    index: -1,
    winner: 'us',
    player: '',
    actionCode: '',
    memo: '',
  };

  let currentSubAction = {
    outPlayer: '',
    inPlayer: '',
    position: -1,
  };

  let showAllRallies = false;

  // ==========================================
  // ストレージキー
  // ==========================================
  const ROSTER_STORAGE_KEY = 'volleyscore_roster_data_v1';
  const ACTIVE_MATCH_STORAGE_KEY = 'volleyscore_active_match_v2';
  const SAVED_MATCHES_STORAGE_KEY = 'volleyscore_saved_matches_v2';

  function saveRosterToStorage() {
    try {
      localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(appState.roster));
    } catch (e) {
      console.warn('Roster save failed:', e);
    }
  }

  function loadRosterFromStorage() {
    try {
      const saved = localStorage.getItem(ROSTER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          appState.roster = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Roster load failed:', e);
    }
    appState.roster = [...DEFAULT_ROSTER];
    saveRosterToStorage();
  }

  function saveSavedMatchesToStorage() {
    try {
      localStorage.setItem(SAVED_MATCHES_STORAGE_KEY, JSON.stringify(appState.savedMatches));
    } catch (e) {
      console.warn('Saved matches archive failed:', e);
    }
  }

  function loadSavedMatchesFromStorage() {
    try {
      const saved = localStorage.getItem(SAVED_MATCHES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          appState.savedMatches = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('Saved matches load failed:', e);
    }
    appState.savedMatches = [JSON.parse(JSON.stringify(SAMPLE_MATCH_DATA))];
    saveSavedMatchesToStorage();
  }

  function saveActiveMatchToStorage() {
    try {
      localStorage.setItem(ACTIVE_MATCH_STORAGE_KEY, JSON.stringify(appState.match));
    } catch (e) {
      console.warn('Active match save failed:', e);
    }
  }

  function loadActiveMatchFromStorage() {
    try {
      const saved = localStorage.getItem(ACTIVE_MATCH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.sets && parsed.sets.length > 0) {
          appState.match = parsed;
          recalculateSetProgress(getCurrentSet());
          return;
        }
      }
    } catch (e) {
      console.warn('Active match load failed:', e);
    }
    appState.match = createEmptyMatch();
    recalculateSetProgress(getCurrentSet());
  }

  function checkUrlHashImport() {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#match=')) {
        const encoded = hash.substring(7);
        const jsonStr = decodeURIComponent(escape(atob(encoded)));
        const importedMatch = JSON.parse(jsonStr);
        if (importedMatch && importedMatch.sets) {
          importedMatch.id = 'imported_' + Date.now();
          appState.match = importedMatch;
          saveCurrentMatchToArchive(true);
          history.replaceState(null, '', window.location.pathname + window.location.search);
          alert(`共有リンクから試合データ「${importedMatch.date} vs ${importedMatch.opponent}」を読み込み、保存しました！`);
        }
      }
    } catch (e) {
      console.warn('Hash import error:', e);
    }
  }

  function initApp() {
    loadRosterFromStorage();
    loadSavedMatchesFromStorage();
    loadActiveMatchFromStorage();
    checkUrlHashImport();
    setupEventListeners();
    updateUI();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function createEmptyMatch(dateStr, oppStr) {
    const today = new Date();
    const defaultDate = `${today.getMonth() + 1}/${today.getDate()}`;
    const defaultStartingLineup = appState.roster && appState.roster.length >= 6
      ? appState.roster.slice(0, 6).map(p => p.name)
      : ['選手1', '選手2', '選手3', '選手4', '選手5', '選手6'];

    return {
      id: 'm_' + Date.now(),
      date: dateStr || defaultDate,
      opponent: oppStr || '相手チーム',
      myTeamName: '自チーム',
      currentSetIndex: 0,
      savedAt: Date.now(),
      sets: [
        {
          setNumber: 1,
          firstServe: 'us',
          startingLineup: [...defaultStartingLineup],
          events: [],
        }
      ]
    };
  }

  function getCurrentSet() {
    if (!appState.match || !appState.match.sets || appState.match.sets.length === 0) {
      appState.match = createEmptyMatch();
    }
    const idx = Math.min(Math.max(appState.match.currentSetIndex || 0, 0), appState.match.sets.length - 1);
    return appState.match.sets[idx];
  }

  // ==========================================
  // バレーボール ルール計算エンジン
  // ==========================================
  function recalculateSetProgress(set) {
    if (!set) return;

    let scoreUs = 0;
    let scoreThem = 0;
    let servingTeam = set.firstServe || 'us';
    let serverIndex = 0;

    const currentLineup = [...(set.startingLineup || [])];
    while (currentLineup.length < 6) {
      currentLineup.push(`選手${currentLineup.length + 1}`);
    }

    let rallyCount = 0;

    set.events.forEach((evt) => {
      if (evt.type === 'sub') {
        if (evt.position >= 0 && evt.position < 6 && evt.inPlayer) {
          currentLineup[evt.position] = evt.inPlayer;
        }
        evt.scoreUs = scoreUs;
        evt.scoreThem = scoreThem;
        return;
      }

      rallyCount++;
      evt.rallyNumber = rallyCount;
      evt.servingTeam = servingTeam;
      evt.serverIndex = serverIndex;
      evt.serverName = servingTeam === 'us' ? currentLineup[serverIndex] : '相手';

      if (evt.winner === 'us') {
        scoreUs++;
        evt.isSideout = (servingTeam === 'them');
        evt.isBreak = (servingTeam === 'us');

        if (servingTeam === 'them') {
          servingTeam = 'us';
          if (rallyCount > 1) {
            serverIndex = (serverIndex + 1) % 6;
          }
        }
      } else {
        scoreThem++;
        evt.isSideout = false;
        evt.isBreak = false;

        if (servingTeam === 'us') {
          servingTeam = 'them';
        }
      }

      evt.scoreUs = scoreUs;
      evt.scoreThem = scoreThem;
      evt.currentLineupSnapshot = [...currentLineup];
    });

    set.scoreUs = scoreUs;
    set.scoreThem = scoreThem;
    set.currentServingTeam = servingTeam;
    set.currentServerIndex = serverIndex;
    set.currentLineup = currentLineup;
  }

  // ==========================================
  // 試合保存 & 読み込み
  // ==========================================
  function saveCurrentMatchToArchive(silent = false) {
    if (!appState.match) return;

    appState.match.sets.forEach(s => recalculateSetProgress(s));
    appState.match.id = appState.match.id || ('m_' + Date.now());
    appState.match.savedAt = Date.now();

    const existingIdx = appState.savedMatches.findIndex(m => m.id === appState.match.id);
    const matchCopy = JSON.parse(JSON.stringify(appState.match));

    if (existingIdx >= 0) {
      appState.savedMatches[existingIdx] = matchCopy;
    } else {
      appState.savedMatches.unshift(matchCopy);
    }

    saveSavedMatchesToStorage();
    saveActiveMatchToStorage();
    updateUI();

    if (!silent) {
      alert(`「${appState.match.date} vs ${appState.match.opponent}」を試合一覧に保存しました！いつでも上の「試合一覧」から開けます。`);
    }
  }

  function loadMatchFromArchive(matchId) {
    const target = appState.savedMatches.find(m => m.id === matchId);
    if (!target) return;

    saveCurrentMatchToArchive(true);

    appState.match = JSON.parse(JSON.stringify(target));
    appState.match.sets.forEach(s => recalculateSetProgress(s));
    saveActiveMatchToStorage();
    updateUI();
    closeAllModals();
    switchTab('tab-record');
  }

  window.deleteSavedMatch = function (matchId) {
    const target = appState.savedMatches.find(m => m.id === matchId);
    if (!target) return;

    if (confirm(`試合データ「${target.date} vs ${target.opponent}」を一覧から削除しますか？`)) {
      appState.savedMatches = appState.savedMatches.filter(m => m.id !== matchId);
      saveSavedMatchesToStorage();

      if (appState.match && appState.match.id === matchId) {
        appState.match = createEmptyMatch();
        saveActiveMatchToStorage();
      }
      updateUI();
    }
  };

  window.openSavedMatch = function (matchId) {
    loadMatchFromArchive(matchId);
  };

  // ==========================================
  // アクション (得点・交代・Undo)
  // ==========================================
  function addRally(winner, player, actionCode, memo) {
    const set = getCurrentSet();
    const defaultPlayer = winner === 'us'
      ? set.currentLineup[set.currentServerIndex]
      : '相手';

    set.events.push({
      type: 'rally',
      winner: winner,
      player: player || defaultPlayer,
      actionCode: actionCode || (winner === 'us' ? '得点' : '失点'),
      memo: memo || '',
    });

    recalculateSetProgress(set);
    saveActiveMatchToStorage();
    saveCurrentMatchToArchive(true);
    updateUI();
  }

  function executeSubstitution(outPlayer, inPlayer, position) {
    const set = getCurrentSet();
    set.events.push({
      type: 'sub',
      outPlayer: outPlayer,
      inPlayer: inPlayer,
      position: position,
    });

    recalculateSetProgress(set);
    saveActiveMatchToStorage();
    saveCurrentMatchToArchive(true);
    updateUI();
  }

  function undoLastAction() {
    const set = getCurrentSet();
    if (!set.events || set.events.length === 0) return;
    set.events.pop();
    recalculateSetProgress(set);
    saveActiveMatchToStorage();
    saveCurrentMatchToArchive(true);
    updateUI();
  }

  function manuallyRotate() {
    const set = getCurrentSet();
    set.currentServerIndex = (set.currentServerIndex + 1) % 6;
    saveActiveMatchToStorage();
    updateUI();
  }

  // ==========================================
  // ラリー途中編集
  // ==========================================
  window.openEditRallyModal = function (eventIndex) {
    const set = getCurrentSet();
    if (!set.events || !set.events[eventIndex]) return;

    const evt = set.events[eventIndex];
    if (evt.type === 'sub') {
      if (confirm(`この選手交代（${evt.outPlayer} ➔ ${evt.inPlayer}）を取り消しますか？`)) {
        window.deleteEvent(eventIndex);
      }
      return;
    }

    editingEventState = {
      index: eventIndex,
      winner: evt.winner || 'us',
      player: evt.player || '',
      actionCode: evt.actionCode || '',
      memo: evt.memo || '',
    };

    document.getElementById('edit-rally-title').textContent = `#${evt.rallyNumber} ラリーの編集`;
    document.getElementById('edit-action-memo').value = editingEventState.memo;

    updateEditWinnerButtons();
    renderEditPlayerChips();
    renderEditActionChips();

    document.getElementById('modal-edit-rally').classList.remove('hidden');
  };

  function updateEditWinnerButtons() {
    const btnUs = document.getElementById('btn-edit-winner-us');
    const btnThem = document.getElementById('btn-edit-winner-them');

    if (editingEventState.winner === 'us') {
      btnUs.className = 'p-2.5 rounded-lg border text-center font-bold bg-blue-600 text-white border-blue-700 shadow-sm';
      btnThem.className = 'p-2.5 rounded-lg border text-center font-bold bg-slate-50 text-slate-700 border-slate-300';
    } else {
      btnUs.className = 'p-2.5 rounded-lg border text-center font-bold bg-slate-50 text-slate-700 border-slate-300';
      btnThem.className = 'p-2.5 rounded-lg border text-center font-bold bg-rose-600 text-white border-rose-700 shadow-sm';
    }
  }

  function renderEditPlayerChips() {
    const set = getCurrentSet();
    const container = document.getElementById('edit-player-chips');
    container.innerHTML = '';

    const list = [...set.currentLineup, ...appState.roster.map(p => p.name).filter(n => !set.currentLineup.includes(n)), '相手', '自チーム'];

    list.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-select-btn ${editingEventState.player === p ? 'selected' : ''}`;
      btn.textContent = p;
      btn.onclick = () => {
        editingEventState.player = p;
        renderEditPlayerChips();
      };
      container.appendChild(btn);
    });
  }

  function renderEditActionChips() {
    const container = document.getElementById('edit-action-chips');
    container.innerHTML = '';
    const isUs = (editingEventState.winner === 'us');
    const actions = isUs ? ACTIONS_WIN : ACTIONS_LOSS;

    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isSelected = (editingEventState.actionCode === a.code);
      btn.className = `chip-select-btn ${isUs ? 'action-kill' : 'action-mistake'} ${isSelected ? 'selected' : ''}`;
      btn.textContent = a.label;
      btn.onclick = () => {
        editingEventState.actionCode = a.code;
        renderEditActionChips();
      };
      container.appendChild(btn);
    });
  }

  function closeEditRallyModal() {
    document.getElementById('modal-edit-rally').classList.add('hidden');
  }

  window.deleteEvent = function (eventIndex) {
    const set = getCurrentSet();
    if (!set.events || !set.events[eventIndex]) return;

    if (confirm('この記録を削除しますか？\n（削除後、以降のスコアとローテーションが自動再計算されます）')) {
      set.events.splice(eventIndex, 1);
      recalculateSetProgress(set);
      saveActiveMatchToStorage();
      saveCurrentMatchToArchive(true);
      updateUI();
      closeEditRallyModal();
    }
  };

  function switchTab(targetId) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

    const tabBtn = document.querySelector(`.nav-tab[data-tab="${targetId}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    const tabContent = document.getElementById(targetId);
    if (tabContent) tabContent.classList.remove('hidden');

    if (targetId === 'tab-notebook') {
      updateZigzagNotebook(getCurrentSet());
    }
  }

  function closeAllModals() {
    document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
  }

  // ==========================================
  // UI更新統括
  // ==========================================
  function updateUI() {
    const currentSet = getCurrentSet();
    recalculateSetProgress(currentSet);

    updateHeaderAndSetTabs();
    updateScoreBoard(currentSet);
    updateRotationGrid(currentSet);
    updateRecentEvents(currentSet);
    updateZigzagNotebook(currentSet);
    updateStatsView(currentSet);
    updateMatchesArchiveModal();
    updateRosterModal();
    updateSettingsModal(currentSet);

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateHeaderAndSetTabs() {
    const currentSet = getCurrentSet();
    document.getElementById('match-header-info').textContent =
      `${appState.match.date} vs ${appState.match.opponent} (第${currentSet.setNumber}セット)`;

    const setTabsContainer = document.getElementById('set-tabs-container');
    setTabsContainer.innerHTML = '';

    appState.match.sets.forEach((s, idx) => {
      const isActive = (idx === appState.match.currentSetIndex);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `set-tab-btn ${isActive ? 'active' : ''}`;
      btn.textContent = `Set ${s.setNumber} (${s.scoreUs || 0}-${s.scoreThem || 0})`;
      btn.onclick = () => {
        appState.match.currentSetIndex = idx;
        saveActiveMatchToStorage();
        updateUI();
      };
      setTabsContainer.appendChild(btn);
    });
  }

  function updateScoreBoard(set) {
    const scoreUs = set.scoreUs || 0;
    const scoreThem = set.scoreThem || 0;

    document.getElementById('score-us').textContent = scoreUs;
    document.getElementById('score-them').textContent = scoreThem;
    document.getElementById('display-team-name').textContent = appState.match.myTeamName || '自チーム';
    document.getElementById('display-opponent-name').textContent = `相手 (${appState.match.opponent || '相手'})`;
    document.getElementById('display-set-number').textContent = `Set ${set.setNumber}`;

    const diff = scoreUs - scoreThem;
    const leadEl = document.getElementById('display-lead');
    if (diff > 0) {
      leadEl.textContent = `${diff}点リード`;
      leadEl.className = 'text-[10px] text-blue-600 font-semibold mt-1';
    } else if (diff < 0) {
      leadEl.textContent = `${Math.abs(diff)}点ビハインド`;
      leadEl.className = 'text-[10px] text-red-600 font-semibold mt-1';
    } else {
      leadEl.textContent = '同点';
      leadEl.className = 'text-[10px] text-slate-400 mt-1';
    }

    const isUsServe = (set.currentServingTeam === 'us');
    document.getElementById('us-serve-badge').style.visibility = isUsServe ? 'visible' : 'hidden';
    document.getElementById('them-serve-badge').style.visibility = !isUsServe ? 'visible' : 'hidden';

    const currentServerName = isUsServe
      ? `[${set.currentLineup[set.currentServerIndex]}] (自チーム)`
      : `相手サーブ`;
    document.getElementById('current-server-display').textContent = currentServerName;

    document.getElementById('btn-undo').disabled = (!set.events || set.events.length === 0);
  }

  function updateRotationGrid(set) {
    const grid = document.getElementById('rotation-players-grid');
    grid.innerHTML = '';

    set.currentLineup.forEach((player, idx) => {
      const isServer = (set.currentServingTeam === 'us' && set.currentServerIndex === idx);
      const isSubbed = (set.startingLineup && set.startingLineup[idx] !== player);

      const div = document.createElement('div');
      div.className = `p-2 rounded-lg border text-xs cursor-pointer transition relative ${
        isServer
          ? 'bg-amber-50 border-2 border-amber-500 font-bold text-amber-900 shadow-sm'
          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
      }`;
      div.innerHTML = `
        <div class="flex items-center justify-between text-[10px] text-slate-400">
          <span>P${idx + 1}</span>
          ${isSubbed ? '<span class="text-[9px] text-amber-600 font-bold bg-amber-100 px-1 rounded">交代</span>' : ''}
        </div>
        <div class="truncate font-semibold text-xs mt-0.5">${player}</div>
        ${isServer ? '<div class="text-[9px] text-amber-600 font-bold mt-0.5">🏐 サーバー</div>' : ''}
      `;
      div.onclick = () => {
        set.currentServingTeam = 'us';
        set.currentServerIndex = idx;
        saveActiveMatchToStorage();
        updateUI();
      };
      grid.appendChild(div);
    });
  }

  function updateRecentEvents(set) {
    const list = document.getElementById('recent-rallies-list');
    const totalEl = document.getElementById('total-rallies-count');
    const toggleBtn = document.getElementById('btn-toggle-all-rallies');
    const ralliesOnly = set.events.filter(e => e.type === 'rally');
    totalEl.textContent = `合計 ${ralliesOnly.length} ラリー`;

    if (!set.events || set.events.length === 0) {
      list.innerHTML = '<div class="text-center py-2 text-slate-400">まだ記録がありません</div>';
      return;
    }

    list.innerHTML = '';
    const displayEvents = showAllRallies
      ? set.events.map((e, idx) => ({ evt: e, originalIndex: idx })).reverse()
      : set.events.slice(-4).map((e, idx) => ({ evt: e, originalIndex: set.events.length - 4 + idx })).reverse();

    toggleBtn.textContent = showAllRallies ? '折りたたむ' : 'すべて表示';

    displayEvents.forEach(({ evt, originalIndex }) => {
      const item = document.createElement('div');
      if (evt.type === 'sub') {
        item.className = 'p-2 rounded-lg border bg-amber-50 border-amber-200 text-amber-900 text-xs flex items-center justify-between';
        item.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="font-bold text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded">交代</span>
            <span class="font-bold">OUT: ${evt.outPlayer} ➔ IN: ${evt.inPlayer} (P${evt.position + 1})</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-slate-500 text-[11px] mr-1">${evt.scoreUs} - ${evt.scoreThem}</span>
            <button type="button" class="text-amber-800 hover:text-red-600 p-1 rounded hover:bg-amber-100 transition" title="交代を取り消す" onclick="window.deleteEvent(${originalIndex})">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
      } else {
        const isUs = (evt.winner === 'us');
        item.className = `p-2 rounded-lg border flex items-center justify-between text-xs transition hover:shadow-sm ${
          isUs ? 'bg-blue-50/60 border-blue-200 text-blue-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'
        }`;
        item.innerHTML = `
          <div class="flex items-center gap-2 truncate pr-2">
            <span class="font-bold text-[11px] px-1.5 py-0.5 rounded ${isUs ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'} shrink-0">
              #${evt.rallyNumber}
            </span>
            <span class="font-bold shrink-0">${isUs ? '自得点' : '相手得点'}</span>
            <span class="text-slate-600 font-medium truncate">(${evt.player} : ${evt.actionCode}${evt.memo ? ` - ${evt.memo}` : ''})</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="font-bold text-slate-700 mr-1">${evt.scoreUs} - ${evt.scoreThem}</span>
            <button type="button" class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition" title="このラリーを修正・編集" onclick="window.openEditRallyModal(${originalIndex})">
              <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
            </button>
            <button type="button" class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition" title="このラリーを削除" onclick="window.deleteEvent(${originalIndex})">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        `;
      }
      list.appendChild(item);
    });
  }

  // ジグザグ推移ノート描画
  function updateZigzagNotebook(set) {
    document.getElementById('note-title-date').textContent = appState.match.date || '';
    document.getElementById('note-title-vs').textContent = `vs ${appState.match.opponent || '相手'}`;
    const setKanji = ['①', '②', '③', '④', '⑤'][set.setNumber - 1] || `${set.setNumber}`;
    document.getElementById('note-title-set').textContent = setKanji;

    document.getElementById('note-final-us').textContent = set.scoreUs || 0;
    document.getElementById('note-final-them').textContent = set.scoreThem || 0;

    const container = document.getElementById('zigzag-canvas-container');
    const nodesContainer = document.getElementById('zigzag-nodes-container');
    const svg = document.getElementById('zigzag-svg');

    nodesContainer.innerHTML = '';
    svg.innerHTML = '';

    if (!set.events || set.events.length === 0) {
      nodesContainer.innerHTML = '<div class="text-center py-10 text-slate-400">データがありません。記録・入力タブからスコアをつけてください。</div>';
      container.style.height = '200px';
      return;
    }

    const rowHeight = 44;
    const totalHeight = Math.max(set.events.length * rowHeight + 40, 400);
    container.style.height = `${totalHeight}px`;

    const containerWidth = container.clientWidth || 360;

    const leftBubbleX = Math.round(containerWidth * 0.40);
    const rightBubbleX = Math.round(containerWidth * 0.60);

    const pointsArray = [];
    let currentShownServer = null;

    set.events.forEach((evt, idx) => {
      const y = idx * rowHeight + 30;

      const rowDiv = document.createElement('div');
      rowDiv.className = 'absolute w-full flex items-center pointer-events-auto';
      rowDiv.style.top = `${y - 14}px`;
      rowDiv.style.left = '0';
      rowDiv.style.height = '28px';

      if (evt.type === 'sub') {
        rowDiv.innerHTML = `
          <div class="w-full flex items-center justify-center">
            <span class="sub-event-box cursor-pointer" onclick="window.openEditRallyModal(${idx})">
              🔄 交代: ${evt.outPlayer} ➔ ${evt.inPlayer}
            </span>
          </div>
        `;
        nodesContainer.appendChild(rowDiv);
        return;
      }

      const isUs = (evt.winner === 'us');
      const pointNum = isUs ? evt.scoreUs : evt.scoreThem;
      const pointX = isUs ? leftBubbleX : rightBubbleX;

      pointsArray.push(`${pointX},${y}`);

      let serverBoxHtml = '';
      if (evt.servingTeam === 'us') {
        const sName = evt.serverName;
        if (sName !== currentShownServer || idx === 0) {
          serverBoxHtml = `<span class="server-box">[${sName}]</span>`;
          currentShownServer = sName;
        }
      } else {
        currentShownServer = null;
      }

      let detailText = '';
      if (evt.memo) {
        detailText = evt.memo;
      } else if (evt.actionCode && evt.actionCode !== '得点' && evt.actionCode !== '失点') {
        detailText = `${evt.player !== '相手' ? evt.player : ''}${evt.actionCode}`;
      }

      if (isUs) {
        rowDiv.innerHTML = `
          <div class="absolute left-1 flex items-center">
            ${serverBoxHtml}
          </div>
          <div class="absolute flex items-center justify-end pr-2 text-right cursor-pointer" style="left: 45px; right: ${containerWidth - leftBubbleX + 16}px;" onclick="window.openEditRallyModal(${idx})">
            <span class="play-detail-text truncate" title="${detailText} (クリックで編集)">${detailText}</span>
          </div>
          <div class="absolute cursor-pointer" style="left: ${leftBubbleX - 14}px; top: 0px;" onclick="window.openEditRallyModal(${idx})">
            <span class="point-bubble us-point" title="クリックで編集">${pointNum}</span>
          </div>
        `;
      } else {
        rowDiv.innerHTML = `
          <div class="absolute cursor-pointer" style="left: ${rightBubbleX - 14}px; top: 0px;" onclick="window.openEditRallyModal(${idx})">
            <span class="point-bubble them-point" title="クリックで編集">${pointNum}</span>
          </div>
          <div class="absolute flex items-center justify-start pl-2 text-left cursor-pointer" style="left: ${rightBubbleX + 16}px; right: 8px;" onclick="window.openEditRallyModal(${idx})">
            <span class="play-detail-text truncate" title="${detailText} (クリックで編集)">${detailText}</span>
          </div>
        `;
      }

      nodesContainer.appendChild(rowDiv);
    });

    if (pointsArray.length > 1) {
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', pointsArray.join(' '));
      polyline.setAttribute('fill', 'none');
      polyline.setAttribute('stroke', '#dc2626');
      polyline.setAttribute('stroke-width', '2.5');
      polyline.setAttribute('stroke-linecap', 'round');
      polyline.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(polyline);
    }
  }

  // スタッツ集計ビュー更新
  function updateStatsView(set) {
    let sideoutWins = 0, sideoutTotal = 0;
    let breakWins = 0, breakTotal = 0;

    const rotationStats = (set.startingLineup || []).map(name => ({
      name: name,
      oppServe: { w: 0, l: 0 },
      myServe: { w: 0, l: 0 },
    }));

    const playerStatsMap = {};
    appState.roster.forEach(p => {
      playerStatsMap[p.name] = { w: 0, l: 0, sp: 0, sa: 0, bp: 0, mistakes: {} };
    });

    const rallies = set.events.filter(e => e.type === 'rally');

    rallies.forEach(r => {
      const sIdx = r.serverIndex % 6;

      if (r.servingTeam === 'them') {
        sideoutTotal++;
        if (r.winner === 'us') {
          sideoutWins++;
          if (rotationStats[sIdx]) rotationStats[sIdx].oppServe.w++;
        } else {
          if (rotationStats[sIdx]) rotationStats[sIdx].oppServe.l++;
        }
      } else {
        breakTotal++;
        if (r.winner === 'us') {
          breakWins++;
          if (rotationStats[sIdx]) rotationStats[sIdx].myServe.w++;
        } else {
          if (rotationStats[sIdx]) rotationStats[sIdx].myServe.l++;
        }
      }

      const p = r.player;
      if (!playerStatsMap[p] && p !== '相手' && p !== '自チーム') {
        playerStatsMap[p] = { w: 0, l: 0, sp: 0, sa: 0, bp: 0, mistakes: {} };
      }
      if (playerStatsMap[p]) {
        if (r.winner === 'us') {
          playerStatsMap[p].w++;
          if (r.actionCode === 'SP') playerStatsMap[p].sp++;
          else if (r.actionCode === 'SA') playerStatsMap[p].sa++;
          else if (r.actionCode === 'BP') playerStatsMap[p].bp++;
        } else {
          playerStatsMap[p].l++;
          const code = r.actionCode || '失点';
          playerStatsMap[p].mistakes[code] = (playerStatsMap[p].mistakes[code] || 0) + 1;
        }
      }
    });

    const sideoutRate = sideoutTotal > 0 ? ((sideoutWins / sideoutTotal) * 100).toFixed(1) : '0.0';
    const breakRate = breakTotal > 0 ? ((breakWins / breakTotal) * 100).toFixed(1) : '0.0';

    document.getElementById('stat-sideout-rate').textContent = `${sideoutRate}%`;
    document.getElementById('stat-sideout-fraction').textContent = `${sideoutWins} / ${sideoutTotal}`;

    document.getElementById('stat-break-rate').textContent = `${breakRate}%`;
    document.getElementById('stat-break-fraction').textContent = `${breakWins} / ${breakTotal}`;

    const rotTbody = document.getElementById('stats-rotation-table-body');
    rotTbody.innerHTML = '';
    let totalOppW = 0, totalOppL = 0, totalMyW = 0, totalMyL = 0;

    rotationStats.forEach(st => {
      totalOppW += st.oppServe.w;
      totalOppL += st.oppServe.l;
      totalMyW += st.myServe.w;
      totalMyL += st.myServe.l;

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';
      tr.innerHTML = `
        <td class="py-2 px-2 text-left font-bold text-slate-800">${st.name}</td>
        <td class="py-2 px-1 font-bold text-blue-700 bg-blue-50/20">${st.oppServe.w || '-'}</td>
        <td class="py-2 px-1 text-slate-600 bg-blue-50/20 border-r border-slate-200">${st.oppServe.l || '-'}</td>
        <td class="py-2 px-1 font-bold text-emerald-700 bg-emerald-50/20">${st.myServe.w || '-'}</td>
        <td class="py-2 px-1 text-slate-600 bg-emerald-50/20">${st.myServe.l || '-'}</td>
      `;
      rotTbody.appendChild(tr);
    });

    const rotTfoot = document.getElementById('stats-rotation-table-foot');
    rotTfoot.innerHTML = `
      <td class="py-2 px-2 text-left">合計</td>
      <td class="py-2 px-1 text-blue-800">${totalOppW}</td>
      <td class="py-2 px-1 text-slate-700 border-r border-slate-200">${totalOppL}</td>
      <td class="py-2 px-1 text-emerald-800">${totalMyW}</td>
      <td class="py-2 px-1 text-slate-700">${totalMyL}</td>
    `;

    const pTbody = document.getElementById('stats-player-table-body');
    pTbody.innerHTML = '';

    Object.keys(playerStatsMap).forEach(name => {
      const st = playerStatsMap[name];
      if (st.w === 0 && st.l === 0) return;

      const diff = st.w - st.l;
      const mistakesSummary = Object.entries(st.mistakes)
        .map(([c, count]) => `${c}:${count}`)
        .join(' ') || '-';

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition';
      tr.innerHTML = `
        <td class="py-2 px-2 text-left font-bold text-slate-800">${name}</td>
        <td class="py-2 px-1 font-bold text-blue-700">${st.w}</td>
        <td class="py-2 px-1 font-bold text-rose-700">${st.l}</td>
        <td class="py-2 px-1 font-bold ${diff > 0 ? 'text-blue-600' : diff < 0 ? 'text-red-600' : 'text-slate-500'}">
          ${diff > 0 ? `+${diff}` : diff}
        </td>
        <td class="py-2 px-1 text-slate-600">${st.sp || '-'}</td>
        <td class="py-2 px-1 text-slate-600">${st.sa || '-'}</td>
        <td class="py-2 px-1 text-slate-600">${st.bp || '-'}</td>
        <td class="py-2 px-1 text-[11px] text-slate-500 text-left">${mistakesSummary}</td>
      `;
      pTbody.appendChild(tr);
    });

    if (pTbody.children.length === 0) {
      pTbody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-slate-400">まだプレー記録がありません</td></tr>';
    }
  }

  // ==========================================
  // モーダル内容更新 (試合一覧・選手登録・設定)
  // ==========================================

  // 1. 試合一覧モーダル
  function updateMatchesArchiveModal() {
    const listContainer = document.getElementById('saved-matches-list-container');
    const badge = document.getElementById('saved-matches-count-badge');
    const currentTitle = document.getElementById('current-match-title');
    const currentSubtitle = document.getElementById('current-match-subtitle');

    if (appState.match) {
      currentTitle.textContent = `${appState.match.date} vs ${appState.match.opponent} (${appState.match.myTeamName || '自チーム'})`;
      currentSubtitle.textContent = `全 ${appState.match.sets.length} セット記録中 (現在 Set ${appState.match.sets[(appState.match.currentSetIndex || 0)].setNumber})`;
    }

    listContainer.innerHTML = '';
    badge.textContent = `${appState.savedMatches.length}試合`;

    if (!appState.savedMatches || appState.savedMatches.length === 0) {
      listContainer.innerHTML = '<div class="text-center py-4 text-slate-400 text-xs">まだ保存された試合はありません。「この試合を保存」を押すとここに一覧表示されます。</div>';
      return;
    }

    appState.savedMatches.forEach(m => {
      const isCurrentActive = (appState.match && appState.match.id === m.id);
      const setSummary = m.sets.map(s => {
        recalculateSetProgress(s);
        return `S${s.setNumber}: ${s.scoreUs || 0}-${s.scoreThem || 0}`;
      }).join(' / ');
      const dateStr = m.savedAt ? new Date(m.savedAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

      const card = document.createElement('div');
      card.className = `p-3 rounded-xl border transition ${
        isCurrentActive
          ? 'bg-blue-50/70 border-2 border-blue-500 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`;

      card.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-sm text-slate-800">${m.date} vs ${m.opponent}</span>
              ${isCurrentActive ? '<span class="text-[10px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full">編集中</span>' : ''}
              ${m.id === 'sample_match_sophia_set4' ? '<span class="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-1.5 py-0.2 rounded-full">サンプルノート</span>' : ''}
            </div>
            <div class="text-xs font-semibold text-slate-600 mt-1">${setSummary || 'まだスコア記録なし'}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">保存: ${dateStr || m.date}</div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 shadow-sm transition active:scale-95" onclick="window.openSavedMatch('${m.id}')">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>開く</span>
            </button>
            <button type="button" class="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition" title="この試合を削除" onclick="window.deleteSavedMatch('${m.id}')">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  // 2. 選手登録名簿モーダル
  function updateRosterModal() {
    const rosterContainer = document.getElementById('roster-list-container');
    const rosterBadge = document.getElementById('roster-count-badge');
    rosterContainer.innerHTML = '';
    rosterBadge.textContent = `${appState.roster.length}名`;

    if (!appState.roster || appState.roster.length === 0) {
      rosterContainer.innerHTML = '<div class="py-4 text-center text-slate-400 text-xs">登録されている選手がいません</div>';
      return;
    }

    appState.roster.forEach((player) => {
      const row = document.createElement('div');
      row.className = 'py-2 px-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition';
      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold inline-flex items-center justify-center text-[11px] border border-blue-200">
            ${player.number !== null && player.number !== undefined ? player.number : '-'}
          </span>
          <span class="font-bold text-slate-800 text-sm">${player.name}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition" title="名簿から削除" onclick="window.removeRosterPlayer('${player.id}')">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      rosterContainer.appendChild(row);
    });
  }

  // 3. 設定モーダル
  function updateSettingsModal(set) {
    document.getElementById('setting-date').value = appState.match.date || '';
    document.getElementById('setting-opponent').value = appState.match.opponent || '';
    document.getElementById('setting-my-team').value = appState.match.myTeamName || '自チーム';
    document.getElementById('setting-first-serve').value = set.firstServe || 'us';

    const selectorsContainer = document.getElementById('starting-lineup-selectors');
    selectorsContainer.innerHTML = '';

    const rosterOptions = appState.roster.map(p =>
      `<option value="${p.name}">${p.number !== null && p.number !== undefined ? `#${p.number} ` : ''}${p.name}</option>`
    ).join('');

    for (let i = 0; i < 6; i++) {
      const currentName = (set.startingLineup && set.startingLineup[i]) || (appState.roster[i] ? appState.roster[i].name : `選手${i + 1}`);
      const div = document.createElement('div');
      div.innerHTML = `
        <label class="block text-[11px] font-medium text-slate-600 mb-0.5">P${i + 1} (${i === 0 ? '第1サーバー' : `ローテ${i + 1}`})</label>
        <select id="setting-lineup-${i}" class="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-bold bg-white text-xs">
          ${rosterOptions}
        </select>
      `;
      selectorsContainer.appendChild(div);
      const sel = div.querySelector('select');
      sel.value = currentName;
    }
  }

  function handleAddPlayerSubmit(e) {
    e.preventDefault();
    const nameInput = document.getElementById('input-player-name');
    const numberInput = document.getElementById('input-player-number');

    const name = nameInput.value.trim();
    if (!name) return;

    const numVal = numberInput.value.trim();
    const number = numVal ? parseInt(numVal, 10) : null;

    const exists = appState.roster.some(p => p.name === name);
    if (exists) {
      alert(`「${name}」は既に選手名簿に登録されています。`);
      return;
    }

    appState.roster.push({
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      number: number,
      name: name,
    });

    saveRosterToStorage();

    nameInput.value = '';
    numberInput.value = '';
    nameInput.focus();

    updateUI();
  }

  window.removeRosterPlayer = function (id) {
    if (appState.roster.length <= 6) {
      alert('試合を行うため、選手は最低6名以上登録されている必要があります。');
      return;
    }
    const target = appState.roster.find(p => p.id === id);
    if (!target) return;

    if (confirm(`「${target.name}」選手を登録名簿から削除しますか？`)) {
      appState.roster = appState.roster.filter(p => p.id !== id);
      saveRosterToStorage();
      updateUI();
    }
  };

  // ==========================================
  // モーダル操作
  // ==========================================
  function openPointModal(winner) {
    const set = getCurrentSet();
    currentModalAction = {
      winner: winner,
      player: '',
      actionCode: '',
      memo: '',
    };

    const isUs = (winner === 'us');
    const badge = document.getElementById('modal-point-badge');
    badge.textContent = isUs ? '自チーム得点 (+1)' : '相手得点 / 失点 (+1)';
    badge.className = `px-2.5 py-1 rounded-full text-xs font-bold text-white ${isUs ? 'bg-blue-600' : 'bg-rose-600'}`;

    const currentServerName = set.currentServingTeam === 'us'
      ? set.currentLineup[set.currentServerIndex]
      : '相手';
    document.getElementById('modal-server-info').textContent = `サーバー: ${currentServerName}`;
    document.getElementById('modal-action-memo').value = '';

    const playerContainer = document.getElementById('modal-player-chips');
    playerContainer.innerHTML = '';

    const courtList = [...set.currentLineup];
    const benchList = appState.roster
      .map(p => p.name)
      .filter(name => !courtList.includes(name));

    const allPlayerOptions = [...courtList, ...benchList, '相手', '自チーム'];

    allPlayerOptions.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-select-btn';
      btn.textContent = p;
      btn.onclick = () => {
        currentModalAction.player = p;
        playerContainer.querySelectorAll('.chip-select-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      playerContainer.appendChild(btn);
    });

    const actionContainer = document.getElementById('modal-action-chips');
    actionContainer.innerHTML = '';
    const actions = isUs ? ACTIONS_WIN : ACTIONS_LOSS;

    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-select-btn ${isUs ? 'action-kill' : 'action-mistake'}`;
      btn.textContent = a.label;
      btn.onclick = () => {
        currentModalAction.actionCode = a.code;
        actionContainer.querySelectorAll('.chip-select-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      };
      actionContainer.appendChild(btn);
    });

    document.getElementById('modal-point-detail').classList.remove('hidden');
  }

  function closePointModal() {
    document.getElementById('modal-point-detail').classList.add('hidden');
  }

  function openSubstitutionModal() {
    const set = getCurrentSet();
    currentSubAction = { outPlayer: '', inPlayer: '', position: -1 };

    const confirmBtn = document.getElementById('btn-confirm-sub');
    confirmBtn.disabled = true;

    const outContainer = document.getElementById('sub-out-player-chips');
    outContainer.innerHTML = '';
    set.currentLineup.forEach((player, pos) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-select-btn sub-chip-out';
      btn.textContent = `P${pos + 1}: ${player}`;
      btn.onclick = () => {
        currentSubAction.outPlayer = player;
        currentSubAction.position = pos;
        outContainer.querySelectorAll('.chip-select-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        checkSubReady();
      };
      outContainer.appendChild(btn);
    });

    const inContainer = document.getElementById('sub-in-player-chips');
    inContainer.innerHTML = '';
    appState.roster.forEach(p => {
      const isAlreadyOnCourt = set.currentLineup.includes(p.name);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `chip-select-btn sub-chip-in ${isAlreadyOnCourt ? 'opacity-40 pointer-events-none' : ''}`;
      btn.textContent = p.name + (isAlreadyOnCourt ? ' (出場中)' : '');
      btn.onclick = () => {
        currentSubAction.inPlayer = p.name;
        inContainer.querySelectorAll('.chip-select-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        checkSubReady();
      };
      inContainer.appendChild(btn);
    });

    function checkSubReady() {
      confirmBtn.disabled = !(currentSubAction.outPlayer && currentSubAction.inPlayer && currentSubAction.position >= 0);
    }

    document.getElementById('modal-substitution').classList.remove('hidden');
  }

  function closeSubstitutionModal() {
    document.getElementById('modal-substitution').classList.add('hidden');
  }

  function openNewMatchModal() {
    const today = new Date();
    document.getElementById('new-match-date').value = `${today.getMonth() + 1}/${today.getDate()}`;
    document.getElementById('new-match-opponent').value = '';
    document.getElementById('modal-new-match').classList.remove('hidden');
  }

  function closeNewMatchModal() {
    document.getElementById('modal-new-match').classList.add('hidden');
  }

  // ==========================================
  // イベントリスナー設定
  // ==========================================
  function setupEventListeners() {
    // 3大タブ切り替え
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchTab(tab.dataset.tab);
      });
    });

    // ヘッダーのボタンクリックイベント
    // 1. 保存
    document.getElementById('btn-header-save-match').addEventListener('click', () => saveCurrentMatchToArchive());
    document.getElementById('btn-save-current-to-archive').addEventListener('click', () => saveCurrentMatchToArchive());

    // 2. 新規試合
    document.getElementById('btn-header-new-match').addEventListener('click', openNewMatchModal);

    // 3. 試合一覧ボタン (NEW!)
    document.getElementById('btn-header-matches').addEventListener('click', () => {
      updateMatchesArchiveModal();
      document.getElementById('modal-matches-archive').classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
    document.getElementById('btn-close-matches-modal').addEventListener('click', () => {
      document.getElementById('modal-matches-archive').classList.add('hidden');
    });
    document.getElementById('btn-close-matches-modal-bottom').addEventListener('click', () => {
      document.getElementById('modal-matches-archive').classList.add('hidden');
    });

    // 4. 選手登録ボタン (NEW!)
    document.getElementById('btn-header-roster').addEventListener('click', () => {
      updateRosterModal();
      document.getElementById('modal-roster').classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
    document.getElementById('btn-close-roster-modal').addEventListener('click', () => {
      document.getElementById('modal-roster').classList.add('hidden');
    });
    document.getElementById('btn-close-roster-modal-bottom').addEventListener('click', () => {
      document.getElementById('modal-roster').classList.add('hidden');
    });

    // 5. 設定ボタン (NEW!)
    document.getElementById('btn-header-settings').addEventListener('click', () => {
      updateSettingsModal(getCurrentSet());
      document.getElementById('modal-settings').classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
    document.getElementById('btn-close-settings-modal').addEventListener('click', () => {
      document.getElementById('modal-settings').classList.add('hidden');
    });

    // 選手登録フォーム送信
    const addPlayerForm = document.getElementById('form-add-player');
    if (addPlayerForm) {
      addPlayerForm.addEventListener('submit', handleAddPlayerSubmit);
    }

    // 初期メンバー復元ボタン
    document.getElementById('btn-reset-roster').addEventListener('click', () => {
      if (confirm('選手名簿を初期メンバー（なな, まお, ちづ, りお, まど, はる, かな, まりん）に戻しますか？')) {
        appState.roster = [...DEFAULT_ROSTER];
        saveRosterToStorage();
        updateUI();
      }
    });

    // 試合共有リンクURLコピーボタン
    document.getElementById('btn-copy-share-url').addEventListener('click', () => {
      try {
        const cleanMatch = JSON.parse(JSON.stringify(appState.match));
        const jsonStr = JSON.stringify(cleanMatch);
        const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
        const shareUrl = window.location.origin + window.location.pathname + '#match=' + encoded;

        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('この試合の専用閲覧リンクをコピーしました！\nこのURLをLINEやメールで共有すると、相手のブラウザでもこの試合がそのまま開いて保存されます。');
        }).catch(() => {
          prompt('以下のURLをコピーして共有してください:', shareUrl);
        });
      } catch (err) {
        alert('リンクの生成に失敗しました。');
      }
    });

    // スコア得点ボタン
    document.getElementById('btn-us-point').addEventListener('click', () => openPointModal('us'));
    document.getElementById('btn-them-point').addEventListener('click', () => openPointModal('them'));

    // 選手交代ボタン
    document.getElementById('btn-open-substitution').addEventListener('click', openSubstitutionModal);
    document.getElementById('btn-close-sub-modal').addEventListener('click', closeSubstitutionModal);
    document.getElementById('btn-cancel-sub').addEventListener('click', closeSubstitutionModal);
    document.getElementById('btn-confirm-sub').addEventListener('click', () => {
      executeSubstitution(
        currentSubAction.outPlayer,
        currentSubAction.inPlayer,
        currentSubAction.position
      );
      closeSubstitutionModal();
    });

    // Undoボタン
    document.getElementById('btn-undo').addEventListener('click', undoLastAction);

    // 手動ローテーションボタン
    document.getElementById('btn-manual-rotate').addEventListener('click', manuallyRotate);

    // 全ラリー履歴表示トグルボタン
    document.getElementById('btn-toggle-all-rallies').addEventListener('click', () => {
      showAllRallies = !showAllRallies;
      updateRecentEvents(getCurrentSet());
      if (window.lucide) window.lucide.createIcons();
    });

    // ラリー編集モーダル内のイベント
    document.getElementById('btn-close-edit-modal').addEventListener('click', closeEditRallyModal);
    document.getElementById('btn-cancel-edit').addEventListener('click', closeEditRallyModal);

    document.getElementById('btn-edit-winner-us').addEventListener('click', () => {
      editingEventState.winner = 'us';
      updateEditWinnerButtons();
      renderEditActionChips();
    });
    document.getElementById('btn-edit-winner-them').addEventListener('click', () => {
      editingEventState.winner = 'them';
      updateEditWinnerButtons();
      renderEditActionChips();
    });

    document.getElementById('btn-save-rally-edit').addEventListener('click', () => {
      const set = getCurrentSet();
      if (editingEventState.index >= 0 && set.events[editingEventState.index]) {
        const evt = set.events[editingEventState.index];
        evt.winner = editingEventState.winner;
        evt.player = editingEventState.player;
        evt.actionCode = editingEventState.actionCode;
        evt.memo = document.getElementById('edit-action-memo').value.trim();

        recalculateSetProgress(set);
        saveActiveMatchToStorage();
        saveCurrentMatchToArchive(true);
        updateUI();
        closeEditRallyModal();
        alert('ラリー内容を更新し、以降のスコアとローテーションを再計算しました！');
      }
    });

    document.getElementById('btn-delete-rally-confirm').addEventListener('click', () => {
      if (editingEventState.index >= 0) {
        window.deleteEvent(editingEventState.index);
      }
    });

    // モーダル確定・キャンセル (新規ラリー)
    document.getElementById('btn-close-modal').addEventListener('click', closePointModal);
    document.getElementById('btn-detail-confirm').addEventListener('click', () => {
      const memo = document.getElementById('modal-action-memo').value.trim();
      addRally(
        currentModalAction.winner,
        currentModalAction.player,
        currentModalAction.actionCode,
        memo
      );
      closePointModal();
    });
    document.getElementById('btn-quick-confirm').addEventListener('click', () => {
      addRally(currentModalAction.winner, '', '', '');
      closePointModal();
    });

    // セット追加ボタン
    document.getElementById('btn-add-set').addEventListener('click', () => {
      const newSetNum = appState.match.sets.length + 1;
      const prevSet = appState.match.sets[appState.match.sets.length - 1];
      const prevLineup = prevSet ? [...prevSet.currentLineup] : appState.roster.slice(0, 6).map(p => p.name);
      const nextServe = prevSet && prevSet.firstServe === 'us' ? 'them' : 'us';

      appState.match.sets.push({
        setNumber: newSetNum,
        firstServe: nextServe,
        startingLineup: prevLineup,
        events: [],
      });
      appState.match.currentSetIndex = appState.match.sets.length - 1;
      saveActiveMatchToStorage();
      saveCurrentMatchToArchive(true);
      updateUI();
    });

    // 新規試合作成
    document.getElementById('btn-close-new-match-modal').addEventListener('click', closeNewMatchModal);
    document.getElementById('btn-cancel-new-match').addEventListener('click', closeNewMatchModal);
    document.getElementById('btn-confirm-new-match').addEventListener('click', () => {
      const dateVal = document.getElementById('new-match-date').value.trim();
      const oppVal = document.getElementById('new-match-opponent').value.trim();
      const firstServeVal = document.getElementById('new-match-first-serve').value;

      saveCurrentMatchToArchive(true);

      appState.match = createEmptyMatch(dateVal, oppVal);
      appState.match.sets[0].firstServe = firstServeVal;
      saveActiveMatchToStorage();
      saveCurrentMatchToArchive(true);
      updateUI();
      closeNewMatchModal();
      switchTab('tab-record');
    });

    // セット設定保存ボタン
    document.getElementById('btn-save-settings').addEventListener('click', () => {
      const set = getCurrentSet();
      appState.match.date = document.getElementById('setting-date').value.trim();
      appState.match.opponent = document.getElementById('setting-opponent').value.trim();
      appState.match.myTeamName = document.getElementById('setting-my-team').value.trim() || '自チーム';
      set.firstServe = document.getElementById('setting-first-serve').value;

      const newLineup = [];
      for (let i = 0; i < 6; i++) {
        const val = document.getElementById(`setting-lineup-${i}`).value;
        newLineup.push(val);
      }
      set.startingLineup = newLineup;

      recalculateSetProgress(set);
      saveActiveMatchToStorage();
      saveCurrentMatchToArchive(true);
      updateUI();
      alert('設定変更を反映して保存しました！');
    });

    // 現在のセットのリセット
    document.getElementById('btn-reset-current-set').addEventListener('click', () => {
      const set = getCurrentSet();
      if (confirm(`第${set.setNumber}セットの記録をすべてクリアして0-0にリセットしますか？`)) {
        set.events = [];
        recalculateSetProgress(set);
        saveActiveMatchToStorage();
        saveCurrentMatchToArchive(true);
        updateUI();
      }
    });

    // JSONエクスポート
    document.getElementById('btn-export-json').addEventListener('click', () => {
      const exportData = {
        roster: appState.roster,
        match: appState.match,
        savedMatches: appState.savedMatches,
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `volleyscore_all_data.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // JSONインポート
    document.getElementById('file-import-json').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed) {
            if (parsed.roster) {
              appState.roster = parsed.roster;
              saveRosterToStorage();
            }
            if (parsed.savedMatches) {
              appState.savedMatches = parsed.savedMatches;
              saveSavedMatchesToStorage();
            }
            if (parsed.match) {
              appState.match = parsed.match;
            } else if (parsed.sets) {
              appState.match = parsed;
            }
            saveActiveMatchToStorage();
            recalculateSetProgress(getCurrentSet());
            updateUI();
            alert('試合データを読み込みました！');
          } else {
            alert('無効なファイル形式です。');
          }
        } catch (err) {
          alert('JSONの読み込みに失敗しました。');
        }
      };
      reader.readAsText(file);
    });

    // スタッツテキストコピー
    document.getElementById('btn-copy-stats').addEventListener('click', () => {
      const set = getCurrentSet();
      const sideoutRate = document.getElementById('stat-sideout-rate').textContent;
      const sideoutFrac = document.getElementById('stat-sideout-fraction').textContent;
      const breakRate = document.getElementById('stat-break-rate').textContent;
      const breakFrac = document.getElementById('stat-break-fraction').textContent;

      const text = `【試合結果】${appState.match.date} vs ${appState.match.opponent} 第${set.setNumber}セット
スコア: ${appState.match.myTeamName} ${set.scoreUs || 0} - ${set.scoreThem || 0} 相手
・サイドアウト率: ${sideoutRate} (${sideoutFrac})
・ブレイク率: ${breakRate} (${breakFrac})
スタメン: ${set.startingLineup.join(', ')}
#VolleyScore`;

      navigator.clipboard.writeText(text).then(() => {
        alert('結果テキストをクリップボードにコピーしました！LINEやメモ帳に貼り付けられます。');
      }).catch(() => {
        prompt('以下のテキストをコピーしてください:', text);
      });
    });

    // GitHubガイドモーダル
    const openGuide = () => document.getElementById('modal-github-guide').classList.remove('hidden');
    const closeGuide = () => document.getElementById('modal-github-guide').classList.add('hidden');
    document.getElementById('btn-github-help').addEventListener('click', openGuide);
    const mobileGuideBtn = document.getElementById('btn-github-help-mobile');
    if (mobileGuideBtn) mobileGuideBtn.addEventListener('click', openGuide);
    document.getElementById('btn-close-github-guide').addEventListener('click', closeGuide);

    // 印刷
    document.getElementById('btn-print-note').addEventListener('click', () => {
      window.print();
    });

    // リサイズ
    window.addEventListener('resize', () => {
      updateZigzagNotebook(getCurrentSet());
    });
  }

  document.addEventListener('DOMContentLoaded', initApp);

})();
