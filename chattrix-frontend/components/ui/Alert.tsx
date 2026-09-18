import type { ReactNode } from "react";

const TONE_CLASSES = {
  success: "text-green-400 bg-green-950/50 border-green-900",
  error: "text-red-400 bg-red-950/50 border-red-900",
};

export default function Alert({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={`px-4 py-3 text-sm rounded-lg border ${TONE_CLASSES[tone]}`}
      role="alert"
    >
      {children}
    </div>
  );
}
