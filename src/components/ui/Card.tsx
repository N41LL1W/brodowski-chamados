export default function Card({ className = "", children }: any) {
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm dark: p-6 transition-colors ${className}`}>
      {children}
    </div>
  );
}
