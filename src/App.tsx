import { useState, useEffect, useRef, useCallback } from 'react';
import { runCommand } from './lib/commands';
import { CHAPTERS, BADGES, getLevelTitle, xpForNextLevel } from './lib/quests';
import { playKey, playSuccess, playError } from './lib/sound';
import type { TerminalHistoryItem, UserStats, Quest, Chapter } from './types';
import {
  Terminal, BookOpen, Trophy, HelpCircle, ChevronLeft, ChevronRight,
  Zap, CheckCircle2, Circle, Network, X, Sparkles
} from 'lucide-react';

const STORAGE_KEY = 'networklearn_stats_v1';

function loadStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    xp: 0,
    level: 1,
    title: 'کارآموز شبکه',
    completedQuests: [],
    unlockedBadges: [],
    commandsRunCount: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
  };
}

function saveStats(s: UserStats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function App() {
  const [view, setView] = useState<'landing' | 'lab'>('landing');
  const [stats, setStats] = useState<UserStats>(loadStats);
  const [history, setHistory] = useState<TerminalHistoryItem[]>([
    { id: '0', type: 'system', text: '🌐 NetworkLearn Lab v1.0 — برای شروع «help» را تایپ کنید', timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [activeChapter, setActiveChapter] = useState<Chapter>(CHAPTERS[0]);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBadges, setShowBadges] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const addLine = useCallback((type: TerminalHistoryItem['type'], text: string, command?: string) => {
    setHistory((h) => [
      ...h,
      { id: String(Date.now()) + Math.random(), type, text, command, timestamp: Date.now() },
    ]);
  }, []);

  const completeQuest = useCallback((quest: Quest) => {
    setStats((prev) => {
      if (prev.completedQuests.includes(quest.id)) return prev;
      let xp = prev.xp + quest.xpReward;
      let level = prev.level;
      let title = prev.title;
      while (xp >= xpForNextLevel(level)) {
        xp -= xpForNextLevel(level);
        level += 1;
        title = getLevelTitle(level);
      }
      const unlocked = [...prev.unlockedBadges];
      if (quest.badgeRewardId && !unlocked.includes(quest.badgeRewardId)) {
        unlocked.push(quest.badgeRewardId);
      }
      playSuccess();
      return {
        ...prev,
        xp,
        level,
        title,
        completedQuests: [...prev.completedQuests, quest.id],
        unlockedBadges: unlocked,
      };
    });
    addLine('success', `✅ کوئست «${quest.title}» کامل شد! +${quest.xpReward} XP`);
  }, [addLine]);

  const checkObjectives = useCallback((command: string) => {
    if (!activeQuest) return;
    const updated = { ...activeQuest };
    let changed = false;
    updated.objectives = activeQuest.objectives.map((obj) => {
      if (obj.completed) return obj;
      if (obj.checkType === 'command_run' && obj.expectedCommand) {
        const re = typeof obj.expectedCommand === 'string'
          ? new RegExp(obj.expectedCommand, 'i')
          : obj.expectedCommand;
        if (re.test(command)) {
          changed = true;
          return { ...obj, completed: true };
        }
      }
      return obj;
    });
    if (changed) {
      setActiveQuest(updated);
      const allDone = updated.objectives.every((o) => o.completed);
      if (allDone) completeQuest(updated);
    }
  }, [activeQuest, completeQuest]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    playKey();
    addLine('input', cmd, cmd);
    setCmdHistory((h) => [cmd, ...h].slice(0, 50));
    setHistIdx(-1);
    setInput('');

    setStats((s) => ({ ...s, commandsRunCount: s.commandsRunCount + 1 }));

    const result = runCommand(cmd);
    if (result.output === '__CLEAR__') {
      setHistory([]);
    } else if (result.output) {
      addLine(result.isError ? 'error' : 'output', result.output);
      if (result.isError) playError();
    }

    checkObjectives(cmd);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      if (cmdHistory[next]) setInput(cmdHistory[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx - 1;
      if (next < 0) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(next);
        setInput(cmdHistory[next] || '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // simple autocomplete from known commands
      const known = ['help', 'clear', 'osi', 'ping', 'arp', 'dig', 'subnet', 'traceroute', 'ip', 'about-network', 'packet-journey'];
      const match = known.find((c) => c.startsWith(input.toLowerCase()));
      if (match) setInput(match);
    }
  };

  // ─── Landing ───────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#070a10] text-zinc-100 flex flex-col">
        <header className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Network className="w-8 h-8 text-sky-400" />
            <span className="text-xl font-bold tracking-tight">NetworkLearn</span>
          </div>
          <button
            onClick={() => setView('lab')}
            className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition"
          >
            ورود به لاب
          </button>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            نسخه بازی‌محور NetworkEncyclopedia
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
            شبکه را <span className="text-sky-400">با انجام دادن</span> یاد بگیر
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mb-10">
            ترمینال تعاملی · کوئست‌های مرحله‌ای · سیستم XP و نشان · دستیار هوش مصنوعی
            <br />
            بدون نیاز به تجهیزات واقعی یا شبیه‌ساز سنگین
          </p>
          <button
            onClick={() => setView('lab')}
            className="px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-lg font-semibold shadow-lg shadow-sky-900/40 transition flex items-center gap-2"
          >
            <Terminal className="w-5 h-5" />
            شروع یادگیری
          </button>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full">
            {[
              { icon: '📡', label: '۶+ فصل', sub: 'مبانی تا امنیت' },
              { icon: '⌨️', label: '۲۰+ دستور', sub: 'شبیه‌سازی‌شده' },
              { icon: '🎯', label: 'کوئست تعاملی', sub: 'با هدف مشخص' },
              { icon: '🏆', label: 'گیم‌فیکیشن', sub: 'XP و نشان' },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold">{item.label}</div>
                <div className="text-zinc-500 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>
        </main>

        <footer className="border-t border-zinc-800/80 py-4 text-center text-zinc-600 text-sm">
          بر پایه NetworkEncyclopedia · MIT License
        </footer>
      </div>
    );
  }

  // ─── Lab ───────────────────────────────────────────────────
  const xpNeeded = xpForNextLevel(stats.level);
  const xpPct = Math.min(100, (stats.xp / xpNeeded) * 100);

  return (
    <div className="h-screen flex flex-col bg-[#070a10] text-zinc-100 overflow-hidden">
      {/* Top bar */}
      <header className="shrink-0 h-12 border-b border-zinc-800 flex items-center px-4 gap-4 bg-[#0b0f17]">
        <button onClick={() => setView('landing')} className="flex items-center gap-2 text-sky-400 hover:text-sky-300">
          <Network className="w-5 h-5" />
          <span className="font-bold hidden sm:inline">NetworkLearn</span>
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="font-mono">{stats.xp}</span>
            <span className="text-zinc-500">XP</span>
          </div>
          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${xpPct}%` }} />
          </div>
          <span className="text-zinc-400">Lv.{stats.level}</span>
          <span className="text-zinc-500 hidden md:inline">{stats.title}</span>
        </div>
        <button
          onClick={() => setShowBadges(true)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-amber-400"
          title="نشان‌ها"
        >
          <Trophy className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"
        >
          {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Terminal */}
        <div className="flex-1 flex flex-col min-w-0" onClick={() => inputRef.current?.focus()}>
          <div className="flex-1 overflow-y-auto terminal-scroll p-4 font-mono text-sm leading-relaxed">
            {history.map((item) => (
              <div key={item.id} className="mb-1.5">
                {item.type === 'input' && (
                  <div className="flex gap-2">
                    <span className="text-sky-400 shrink-0">lab@netlearn:~$</span>
                    <span className="text-zinc-100">{item.text}</span>
                  </div>
                )}
                {item.type === 'output' && (
                  <pre className="text-zinc-300 whitespace-pre-wrap font-mono">{item.text}</pre>
                )}
                {item.type === 'error' && (
                  <pre className="text-red-400 whitespace-pre-wrap font-mono">{item.text}</pre>
                )}
                {item.type === 'system' && (
                  <div className="text-sky-500/80">{item.text}</div>
                )}
                {item.type === 'success' && (
                  <div className="text-emerald-400 font-medium">{item.text}</div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="shrink-0 border-t border-zinc-800 p-3 flex items-center gap-2 bg-[#0b0f17]">
            <span className="text-sky-400 font-mono text-sm shrink-0">lab@netlearn:~$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 bg-transparent outline-none font-mono text-sm text-zinc-100 placeholder:text-zinc-600"
              placeholder="دستور را بنویسید... (help)"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0 border-r border-zinc-800 bg-[#0b0f17] flex flex-col overflow-hidden">
            <div className="p-3 border-b border-zinc-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="font-semibold text-sm">سرفصل‌ها و کوئست‌ها</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {CHAPTERS.map((ch) => (
                <div key={ch.id}>
                  <button
                    onClick={() => { setActiveChapter(ch); setActiveQuest(null); }}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                      activeChapter.id === ch.id ? 'bg-sky-600/20 text-sky-300' : 'hover:bg-zinc-800/60 text-zinc-400'
                    }`}
                  >
                    <span>{ch.icon}</span>
                    <span className="flex-1 truncate">{ch.title}</span>
                  </button>

                  {activeChapter.id === ch.id && (
                    <div className="mr-4 mt-1 space-y-0.5">
                      {ch.quests.map((q) => {
                        const done = stats.completedQuests.includes(q.id);
                        return (
                          <button
                            key={q.id}
                            onClick={() => setActiveQuest(q)}
                            className={`w-full text-right px-3 py-1.5 rounded-md text-xs flex items-center gap-2 transition ${
                              activeQuest?.id === q.id
                                ? 'bg-zinc-800 text-zinc-100'
                                : 'hover:bg-zinc-800/40 text-zinc-500'
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 shrink-0" />
                            )}
                            <span className="flex-1 truncate">{q.title}</span>
                            <span className="text-zinc-600">{q.xpReward}xp</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Active quest panel */}
            {activeQuest && (
              <div className="border-t border-zinc-800 p-3 space-y-2 max-h-64 overflow-y-auto">
                <div className="font-semibold text-sm text-sky-300">{activeQuest.title}</div>
                <p className="text-xs text-zinc-400 leading-relaxed">{activeQuest.description}</p>
                <div className="text-xs text-zinc-500">
                  <span className="text-zinc-400">هدف: </span>{activeQuest.targetInstruction}
                </div>
                <div className="space-y-1">
                  {activeQuest.objectives.map((o) => (
                    <div key={o.id} className="flex items-start gap-2 text-xs">
                      {o.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                      )}
                      <span className={o.completed ? 'text-emerald-400/80 line-through' : 'text-zinc-400'}>{o.text}</span>
                    </div>
                  ))}
                </div>
                {activeQuest.hints.length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-500/70">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{activeQuest.hints[0]}</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Badges modal */}
      {showBadges && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowBadges(false)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                نشان‌ها
              </h2>
              <button onClick={() => setShowBadges(false)} className="p-1 hover:bg-zinc-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map((b) => {
                const unlocked = stats.unlockedBadges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border text-center ${
                      unlocked
                        ? 'border-amber-500/40 bg-amber-500/10'
                        : 'border-zinc-800 bg-zinc-900/50 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{b.icon}</div>
                    <div className="text-sm font-medium">{b.title}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{b.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
