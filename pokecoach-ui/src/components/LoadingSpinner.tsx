interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className = "h-4 w-4", label = "Loading" }: LoadingSpinnerProps) {
  return (
    <span
      aria-label={label}
      role="status"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
