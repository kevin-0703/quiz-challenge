export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`focus-ring w-full rounded border border-outline bg-white px-3 py-2 text-sm text-ink placeholder:text-secondary ${className}`}
      {...props}
    />
  );
}
