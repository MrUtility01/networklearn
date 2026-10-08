export interface Objective {
  id: string;
  text: string;
  completed: boolean;
  hint?: string;
  checkType: 'command_run' | 'output_contains' | 'custom';
  expectedCommand?: string | RegExp;
  expectedOutput?: string | RegExp;
}

export interface QuestStep {
  id: string;
  stepNumber: number;
  command: string;
  title: string;
  explanationFa: string;
  whyItMatters: string;
  expectedOutputTip?: string;
  realWorldNote?: string;
  flagsTip?: { flag: string; meaning: string }[];
  targetObjectiveId?: string;
  completed?: boolean;
}

export interface Quest {
  id: string;
  chapterId: string;
  title: string;
  category: string;
  level: number;
  xpReward: number;
  difficulty: 'مقدماتی' | 'متوسط' | 'پیشرفته' | 'سناریو';
  description: string;
  storyContext?: string;
  targetInstruction: string;
  suggestedCommands: string[];
  hints: string[];
  objectives: Objective[];
  steps?: QuestStep[];
  realWorldNote?: string;
  solutionExplanation: string;
  badgeRewardId?: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  levelRequired: number;
  quests: Quest[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  xp: number;
  level: number;
  title: string;
  completedQuests: string[];
  unlockedBadges: string[];
  commandsRunCount: number;
  streakDays: number;
  lastActiveDate: string;
}

export type TerminalItemType = 'input' | 'output' | 'error' | 'system' | 'success' | 'info';

export interface TerminalHistoryItem {
  id: string;
  type: TerminalItemType;
  text: string;
  command?: string;
  timestamp: number;
}

export interface CommandDoc {
  name: string;
  category: string;
  descriptionFa: string;
  descriptionEn: string;
  syntax: string;
  flags: { flag: string; desc: string }[];
  examples: { cmd: string; desc: string }[];
  realWorldNote?: string;
}
