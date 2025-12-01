export function Button({ children, className = "", ...props }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium shadow-sm bg-blue-600 text-white hover:bg-blue-700 
      dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
