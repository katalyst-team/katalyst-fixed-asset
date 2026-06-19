import { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div className={`ks-filterbar ${className}`}>
      {children}
    </div>
  );
}

interface FilterBarLeftProps {
  children: ReactNode;
  className?: string;
}

export function FilterBarLeft({ children, className = "" }: FilterBarLeftProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

interface FilterBarRightProps {
  children: ReactNode;
  className?: string;
}

export function FilterBarRight({ children, className = "" }: FilterBarRightProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

interface FilterBarRowProps {
  children: ReactNode;
  className?: string;
}

export function FilterBarRow({ children, className = "" }: FilterBarRowProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}

interface FilterBarSectionProps {
  children: ReactNode;
  className?: string;
}

export function FilterBarSection({ children, className = "" }: FilterBarSectionProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
    </div>
  );
}
