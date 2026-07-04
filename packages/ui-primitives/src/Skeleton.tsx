import type { HTMLAttributes } from "react";
import { cn } from "./cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ width, height, className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("kiln-skeleton", className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
