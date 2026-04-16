// frontend\src\components\ui\tabs.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface TabsContextType {
  active: string;
  setActive: (v: string) => void;
}
const TabsContext = createContext<TabsContextType>({ active: '', setActive: () => {} });

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}
export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-lg bg-muted p-1 ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      } ${className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}
