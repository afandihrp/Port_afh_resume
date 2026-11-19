"use client";

type WindowControlsProps = {
  onClose: () => void;
};

const CONTROL_COLORS = ["bg-[#ff5f57]", "bg-[#febc2e]", "bg-[#28c840]"];

export function WindowControls({ onClose }: WindowControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {CONTROL_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={onClose}
          aria-label="Close window"
          title="Close"
          className={`h-3 w-3 rounded-full ${color} transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-term-brass`}
        />
      ))}
    </div>
  );
}
