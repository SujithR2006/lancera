import { create } from 'zustand';
import api from '../api/client';

export interface GraftPoint {
  x: number;
  y: number;
  z: number;
  stepIndex: number;
}

export interface TargetZone {
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface Vitals {
  hr: number;
  bp: string;
  spo2: number;
  temp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const STEP_NAMES = [
  'Pre-operative Assessment',
  'Anesthesia Induction',
  'Sternotomy',
  'Cardiopulmonary Bypass Setup',
  'Harvesting Graft Vessel',
  'Aortic Clamping',
  'Performing Bypass Grafts',
  'Removing Bypass Machine',
  'Sternal Closure',
  'Post-operative Care',
];

const STEP_INSTRUMENTS: Record<number, string[]> = {
  0: [],
  1: ['CANNULA'],
  2: ['SCALPEL', 'BONE SAW', 'RETRACTOR'],
  3: ['CANNULA', 'BYPASS MACHINE', 'CLAMPS'],
  4: ['SCALPEL', 'FORCEPS', 'SCISSORS'],
  5: ['CLAMPS', 'CANNULA'],
  6: ['SUTURES/NEEDLE', 'FORCEPS', 'CLAMPS'],
  7: ['CLAMPS', 'BYPASS MACHINE'],
  8: ['BONE SAW', 'SUTURES/NEEDLE', 'RETRACTOR'],
  9: ['ELECTROCAUTERY'],
};

interface SurgeryState {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  currentStep: number;
  completedSteps: number[];
  grafts: GraftPoint[];
  vitals: Vitals;
  ariaText: string;
  ariaWarning: string | null;
  isLoadingAria: boolean;
  score: number;
  health: number;
  stepActionsCompleted: number;
  modelAvailable: boolean;
  selectedTool: string | null;
  activeInstruments: string[];
  showHistory: boolean;
  showCompletion: boolean;
  vrMode: boolean;
  heartRotation: [number, number, number];
  isRotating: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSession: (sessionId: string) => void;
  setModelAvailable: (val: boolean) => void;
  setSelectedTool: (tool: string | null) => void;
  applyAction: (success: boolean) => void;


  updateVitals: (vitals: Partial<Vitals>) => void;
  setAriaText: (text: string, warning?: string | null) => void;
  setAriaLoading: (loading: boolean) => void;
  nextStep: (sessionId: string) => Promise<void>;
  prevStep: () => void;
  addGraft: (point: { x: number; y: number; z: number }, sessionId: string) => Promise<void>;
  setShowHistory: (show: boolean) => void;
  setShowCompletion: (show: boolean) => void;
  toggleVRMode: () => void;
  setHeartRotation: (rot: [number, number, number]) => void;
  toggleRotation: () => void;
  logout: () => void;
}

export const useSurgeryStore = create<SurgeryState>((set, get) => ({
  user: null,
  token: null,
  sessionId: null,
  currentStep: 0,
  completedSteps: [],
  grafts: [],
  vitals: { hr: 72, bp: '120/80', spo2: 98, temp: '36.8' },
  ariaText: '',
  ariaWarning: null,
  isLoadingAria: false,
  score: 0,
  health: 100,
  stepActionsCompleted: 0,
  modelAvailable: false,
  selectedTool: null,
  activeInstruments: STEP_INSTRUMENTS[0] || [],
  showHistory: false,
  showCompletion: false,
  vrMode: false,
  heartRotation: [0, 0, 0],
  isRotating: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setSession: (sessionId) => set({ sessionId }),
  setModelAvailable: (val) => set({ modelAvailable: val }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),

  applyAction: (success) => set((state) => {
    if (success) {
      return { 
        score: Math.min(100, state.score + 2),
        stepActionsCompleted: state.stepActionsCompleted + 1
      };
    } else {
      return { 
        health: Math.max(0, state.health - 15),
        score: Math.max(0, state.score - 5)
      };
    }
  }),



  updateVitals: (vitals) =>
    set((state) => ({ vitals: { ...state.vitals, ...vitals } })),

  setAriaText: (text, warning = null) => set({ ariaText: text, ariaWarning: warning }),
  setAriaLoading: (loading) => set({ isLoadingAria: loading }),

  nextStep: async (sessionId) => {
    const { currentStep, completedSteps } = get();
    if (currentStep >= 9) {
      // Surgery complete
      set({ showCompletion: true });
      try {
        await api.patch(`/surgery/session/${sessionId}/end`);
      } catch (_) {}
      return;
    }

    const newStep = currentStep + 1;
    const newCompleted = completedSteps.includes(currentStep)
      ? completedSteps
      : [...completedSteps, currentStep];
    const newScore = (newCompleted.length / 10) * 100;

    set({
      currentStep: newStep,
      completedSteps: newCompleted,
      score: newScore,
      selectedTool: null,
      stepActionsCompleted: 0, // Reset for new step
      activeInstruments: STEP_INSTRUMENTS[newStep] || [],
      isLoadingAria: true,
    });


    // Update session step in backend
    try {
      await api.patch(`/surgery/session/${sessionId}/step`, {
        stepIndex: newStep,
        action: 'advance',
      });
    } catch (_) {}

    // Get ARIA guidance
    try {
      const { data } = await api.post('/ai/guide', {
        stepIndex: newStep,
        stepName: STEP_NAMES[newStep],
        action: 'advance',
        sessionId,
      });
      set({
        ariaText: data.guidance || '',
        ariaWarning: data.warning || null,
        isLoadingAria: false,
      });
    } catch (_) {
      set({ isLoadingAria: false });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep <= 0) return;
    const newStep = currentStep - 1;
    set({
      currentStep: newStep,
      activeInstruments: STEP_INSTRUMENTS[newStep] || [],
    });
  },

  addGraft: async (point, sessionId) => {
    const { grafts, currentStep } = get();
    if (grafts.length >= 4) return;
    const newGraft: GraftPoint = { ...point, stepIndex: currentStep };
    set({ grafts: [...grafts, newGraft] });

    try {
      await api.post(`/surgery/session/${sessionId}/graft`, newGraft);
    } catch (_) {}
  },

  setShowHistory: (show) => set({ showHistory: show }),
  setShowCompletion: (show) => set({ showCompletion: show }),
  toggleVRMode: () => set((state) => ({ vrMode: !state.vrMode })),
  setHeartRotation: (rot) => set({ heartRotation: rot }),
  toggleRotation: () => set((state) => ({ isRotating: !state.isRotating })),

  logout: () => {
    localStorage.removeItem('lancera_token');
    set({
      user: null,
      token: null,
      sessionId: null,
      currentStep: 0,
      completedSteps: [],
      grafts: [],
      ariaText: '',
      ariaWarning: null,
      score: 0,
      showCompletion: false,
    });
  },
}));

export { STEP_NAMES, STEP_INSTRUMENTS };
