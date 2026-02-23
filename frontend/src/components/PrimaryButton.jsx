export function PrimaryButton({ children, className = "", ...props }) {
    return (
      <button
        className={`px-4 py-3 rounded-2xl bg-black text-white font-medium hover:bg-black/90 disabled:bg-black/30 disabled:cursor-not-allowed transition ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  export function SecondaryButton({ children, className = "", ...props }) {
    return (
      <button
        className={`px-4 py-3 rounded-2xl bg-white border border-black/10 hover:bg-black/5 font-medium transition disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  