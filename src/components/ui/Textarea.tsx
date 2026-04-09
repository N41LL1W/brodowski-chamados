//src\components\ui\Textarea.tsx

export function Textarea({ className = "", ...props }: any) {
  return (
    <textarea
      className={`w-full px-3 py-2 rounded-lg border borderborder
      bg-background text-foreground
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      outline-none transition-all ${className}`}
      {...props}
    />
  );
}
