export function Textarea({ className = "", ...props }: any) {
  return (
    <textarea
      className={`w-full px-3 py-2 rounded-lg border border-gray-300 
      dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      outline-none transition-all ${className}`}
      {...props}
    />
  );
}
