import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function CombIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 4h16v4H4z" />
      <path d="M6 8v12" />
      <path d="M9 8v12" />
      <path d="M12 8v12" />
      <path d="M15 8v12" />
      <path d="M18 8v12" />
    </svg>
  );
}
