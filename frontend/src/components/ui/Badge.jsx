const variants = {
  success: "bg-primary-soft/20 text-primary-ink",
  neutral: "bg-surface-container text-muted",
  warning: "bg-surface-high text-ink",
  danger: "bg-error-soft text-error",
};

export default function Badge({ children, variant = "neutral" }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
}
