export function Textarea({ className = "", ...props }: any) {
  return (
    <textarea
      className={`w-full px-3 py-2 rounded-lg border 
      outline-none transition-all ${className}`}
      {...props}
    />
  );
}
