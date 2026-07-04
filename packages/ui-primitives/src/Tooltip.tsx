"use client";

import { useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import { cn } from "./cn";

export interface TooltipProps {
  content: string;
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, side = "top" }: TooltipProps): ReactNode {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const trigger = cloneElement(children, {
    "aria-describedby": id,
    ...{
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
    },
  } as Record<string, unknown>);

  return (
    <span className="kiln-tooltip-wrap">
      {trigger}
      <span
        role="tooltip"
        id={id}
        className={cn("kiln-tooltip", `kiln-tooltip--${side}`, visible && "kiln-tooltip--visible")}
      >
        {content}
      </span>
    </span>
  );
}
