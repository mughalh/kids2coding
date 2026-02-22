import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppContextType = {
  currentScreen: string;
  currentCourseId: string | null;
  currentLessonId: string | null;
  currentGameId: string | null;
  currentPuzzleId: string | null;
  setCurrentContext: (
    screen: string, 
    options?: {
      courseId?: string | null;
      lessonId?: string | null;
      gameId?: string | null;
      puzzleId?: string | null;
    }
  ) => void;
  clearContext: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string | null>(null);

  const setCurrentContext = (
    screen: string,
    options?: {
      courseId?: string | null;
      lessonId?: string | null;
      gameId?: string | null;
      puzzleId?: string | null;
    }
  ) => {
    setCurrentScreen(screen);
    
    if (options?.courseId !== undefined) setCurrentCourseId(options.courseId);
    if (options?.lessonId !== undefined) setCurrentLessonId(options.lessonId);
    if (options?.gameId !== undefined) setCurrentGameId(options.gameId);
    if (options?.puzzleId !== undefined) setCurrentPuzzleId(options.puzzleId);
  };

  const clearContext = () => {
    setCurrentCourseId(null);
    setCurrentLessonId(null);
    setCurrentGameId(null);
    setCurrentPuzzleId(null);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      currentCourseId,
      currentLessonId,
      currentGameId,
      currentPuzzleId,
      setCurrentContext,
      clearContext,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};