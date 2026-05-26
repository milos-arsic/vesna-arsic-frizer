import { CombIcon } from "@/components/icons/CombIcon";
import { ScissorsIcon } from "@/components/icons/ScissorsIcon";
import type { ComponentType, SVGProps } from "react";

type Decoration = {
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  size: number;
  rotate: number;
  opacity: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

const decorations: Decoration[] = [
  { Icon: ScissorsIcon, top: "8%", left: "4%", size: 72, rotate: -25, opacity: 0.07 },
  { Icon: CombIcon, top: "18%", right: "6%", size: 64, rotate: 15, opacity: 0.06 },
  { Icon: ScissorsIcon, top: "42%", right: "3%", size: 96, rotate: 40, opacity: 0.05 },
  { Icon: CombIcon, bottom: "28%", left: "7%", size: 80, rotate: -12, opacity: 0.06 },
  { Icon: ScissorsIcon, bottom: "12%", right: "12%", size: 68, rotate: -35, opacity: 0.07 },
  { Icon: ScissorsIcon, top: "62%", left: "2%", size: 56, rotate: 55, opacity: 0.04 },
];

export function SalonBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="salon-gradient absolute inset-0" />
      <div className="salon-grid absolute inset-0 opacity-[0.35]" />

      {decorations.map(({ Icon, top, left, right, bottom, size, rotate, opacity }, index) => (
        <Icon
          key={index}
          size={size}
          className="absolute text-amber-900"
          style={{
            top,
            left,
            right,
            bottom,
            opacity,
            transform: `rotate(${rotate}deg)`,
          }}
        />
      ))}

      <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-rose-200/15 blur-3xl" />
    </div>
  );
}
