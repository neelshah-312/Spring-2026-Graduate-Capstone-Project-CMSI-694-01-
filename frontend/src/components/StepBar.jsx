export default function StepBar({ step = 1, total = 4 }) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const s = idx + 1;
          return (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? "bg-black" : "bg-black/10"
              }`}
            />
          );
        })}
      </div>
    );
  }
  