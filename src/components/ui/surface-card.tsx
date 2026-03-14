import type { HTMLAttributes, ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

export function SurfaceCard({ children, className = "", ...props }: SurfaceCardProps) {
  return (
    <div
      className={`glass-panel rounded-[28px] p-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
