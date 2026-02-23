export default function GlassCard({ children, className = "" }) {
    return (
      <div
        className={`rounded-3xl bg-white/80 backdrop-blur border border-black/5 shadow-soft ${className}`}
      >
        {children}
      </div>
    );
  }
  