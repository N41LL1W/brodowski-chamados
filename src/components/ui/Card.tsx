//src\components\ui\Card.tsx

export default function Card({ className = "", children }: any) {
  return (
    <div className={`rounded-xl border border-border bg-card shadow-sm p-6 transition-colors ${className}`}>
      {children}
    </div>
  );
}
