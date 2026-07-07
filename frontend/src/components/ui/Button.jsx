const variants = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink hover:bg-surface-container",
  soft: "bg-primary-soft text-primary-ink hover:bg-primary-soft/85",
  danger: "bg-error text-white hover:bg-error/90",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
