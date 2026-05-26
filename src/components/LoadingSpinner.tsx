import { ScissorsIcon } from "@/components/icons/ScissorsIcon";
import { msg } from "@/lib/messages";

type LoadingSpinnerProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 44,
} as const;

export function LoadingSpinner({
  message = msg.loading,
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute h-14 w-14 animate-pulse-soft rounded-full bg-amber-200/40" />
        <ScissorsIcon
          size={sizeMap[size]}
          className="animate-scissors-spin text-amber-700 drop-shadow-sm"
        />
      </div>
      {message ? (
        <p className="text-sm font-medium tracking-wide text-stone-500">{message}</p>
      ) : null}
    </div>
  );
}
