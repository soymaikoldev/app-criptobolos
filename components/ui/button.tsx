import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "danger";
}

export function Button({ className, variant = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors active:scale-95 disabled:opacity-50",
        variant === "default" && "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
        variant === "outline" && "border border-slate-700 text-slate-200 hover:bg-slate-800 active:bg-slate-700",
        variant === "danger" && "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
        className,
      )}
      {...props}
    />
  );
}
