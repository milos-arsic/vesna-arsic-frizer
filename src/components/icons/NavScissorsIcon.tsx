"use client";

type NavScissorsIconProps = {
  size?: number;
  className?: string;
};

/** Blades cross at this point. */
const HINGE_X = 12;
const HINGE_Y = 12;

export function NavScissorsIcon({ size = 18, className = "" }: NavScissorsIconProps) {
  const origin = `${(HINGE_X / 24) * 100}% ${(HINGE_Y / 24) * 100}%`;

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size, transform: "rotate(-30deg)" }}
      aria-hidden="true"
    >
      {/* Top finger ring → blade runs through cross to lower-right tip */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="nav-scissor-blade-top absolute inset-0 h-full w-full"
        style={{ transformOrigin: origin }}
      >
        <circle cx="6" cy="6" r="2.5" />
        <path d="M8 8 L20 20" />
      </svg>
      {/* Bottom finger ring → blade runs through cross to upper-right tip */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="nav-scissor-blade-bottom absolute inset-0 h-full w-full"
        style={{ transformOrigin: origin }}
      >
        <circle cx="6" cy="18" r="2.5" />
        <path d="M8 16 L20 4" />
      </svg>
    </span>
  );
}
