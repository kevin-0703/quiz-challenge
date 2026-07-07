import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4">
      <div className="w-full max-w-lg rounded border border-outline bg-white shadow-micro">
        <div className="flex items-center justify-between border-b border-outline px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close modal" />
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-outline px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
