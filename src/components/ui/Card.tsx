export default function Card({ className = "", children }: any) {
  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 p-6 transition-colors ${className}`}>
      {children}
    </div>
  );
}
