//src\components\ui\Input.tsx

export function Input({ className = "", ...props }: any) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-lg border border-border
      bg-background text-foreground
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      outline-none transition-all ${className}`}
      {...props}
    />
  );
}
