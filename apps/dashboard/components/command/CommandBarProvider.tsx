'use client';

import { createContext, useState, useEffect, useCallback, useContext } from 'react';

export type CommandBarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  workspaceId: string;
};

export const CommandBarContext = createContext<CommandBarContextType | null>(null);

export function CommandBarProvider({ 
  children, 
  workspaceId 
}: { 
  children: React.ReactNode;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen(o => !o), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggle]);

  return (
    <CommandBarContext.Provider value={{ open, setOpen, toggle, workspaceId }}>
      {children}
    </CommandBarContext.Provider>
  );
}

export function useCommandBar() {
  const context = useContext(CommandBarContext);
  if (!context) {
    throw new Error('useCommandBar must be used within a CommandBarProvider');
  }
  return context;
}
