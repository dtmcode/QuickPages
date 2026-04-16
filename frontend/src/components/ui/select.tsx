// frontend\src\components\ui\select.tsx
'use client';

import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}
const SelectContext = createContext<SelectContextType>({
  value: '', onValueChange: () => {}, open: false, setOpen: () => {},
});

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value, defaultValue, onValueChange, children, disabled }: SelectProps) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const current = value ?? internal;

  const handleChange = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ value: current, onValueChange: handleChange, open, setOpen }}>
      <div className={`relative ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = useContext(SelectContext);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setOpen]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${className ?? ''}`}
    >
      {children}
      <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useContext(SelectContext);
  const [label, setLabel] = useState<string>('');

  useEffect(() => {
    // Label wird von SelectItem via data-attribute gesetzt
    const el = document.querySelector(`[data-select-value="${value}"]`);
    if (el) setLabel(el.textContent ?? value);
    else setLabel(value);
  }, [value]);

  return <span className="truncate">{label || placeholder}</span>;
}

export function SelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open } = useContext(SelectContext);
  if (!open) return null;
  return (
    <div className={`absolute z-50 top-full left-0 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden ${className ?? ''}`}>
      <div className="p-1">
        {children}
      </div>
    </div>
  );
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { value: current, onValueChange } = useContext(SelectContext);
  const isSelected = current === value;

  return (
    <div
      data-select-value={value}
      onClick={() => onValueChange(value)}
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
        isSelected ? 'bg-accent text-accent-foreground font-medium' : ''
      } ${className ?? ''}`}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
}

export function SelectSeparator({ className }: { className?: string }) {
  return <div className={`my-1 h-px bg-border ${className ?? ''}`} />;
}

export function SelectLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`py-1.5 pl-8 pr-2 text-xs font-semibold text-muted-foreground ${className ?? ''}`}>{children}</div>;
}
