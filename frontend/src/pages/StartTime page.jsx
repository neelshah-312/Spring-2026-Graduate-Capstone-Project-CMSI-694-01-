import { useMemo, useState } from "react";

function AppleTimePicker({ value, onChange }) {
    // value is "HH:MM" in 24h
    const parsed = useMemo(() => {
        const [hh, mm] = (value || "09:00").split(":").map(Number);
        const isPM = hh >= 12;
        const hour12 = ((hh + 11) % 12) + 1; // 1-12
        return {
            hour: String(hour12).padStart(2, "0"),
            minute: String(mm).padStart(2, "0"),
            meridiem: isPM ? "PM" : "AM",
        };
    }, [value]);

    const [hour, setHour] = useState(parsed.hour);
    const [minute, setMinute] = useState(parsed.minute);
    const [meridiem, setMeridiem] = useState(parsed.meridiem);

    // keep internal state synced if parent changes
    useMemo(() => {
        setHour(parsed.hour);
        setMinute(parsed.minute);
        setMeridiem(parsed.meridiem);
    }, [parsed.hour, parsed.minute, parsed.meridiem]);

    function emit(nextHour = hour, nextMinute = minute, nextMeridiem = meridiem) {
        const h12 = Number(nextHour);
        const m = Number(nextMinute);
        let h24 = h12 % 12; // 12 -> 0
        if (nextMeridiem === "PM") h24 += 12;
        const out = `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        onChange(out); // ✅ always returns "HH:MM"
    }

    const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
    const minutes = ["00", "15", "30", "45"];

    return (
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/20 backdrop-blur px-4 py-3 shadow-sm">
            {/* hour */}
            <select
                value={hour}
                onChange={(e) => {
                    setHour(e.target.value);
                    emit(e.target.value, minute, meridiem);
                }}
                className="appearance-none bg-transparent text-2xl font-semibold tracking-tight text-[rgb(var(--text))] focus:outline-none"
            >
                {hours.map((h) => (
                    <option key={h} value={h} className="text-black">
                        {h}
                    </option>
                ))}
            </select>

            <span className="text-2xl font-semibold text-[rgb(var(--text))]">:</span>

            {/* minute */}
            <select
                value={minute}
                onChange={(e) => {
                    setMinute(e.target.value);
                    emit(hour, e.target.value, meridiem);
                }}
                className="appearance-none bg-transparent text-2xl font-semibold tracking-tight text-[rgb(var(--text))] focus:outline-none"
            >
                {minutes.map((m) => (
                    <option key={m} value={m} className="text-black">
                        {m}
                    </option>
                ))}
            </select>

            {/* AM/PM segmented */}
            <div className="ml-2 inline-flex rounded-xl bg-white/25 p-1">
                {["AM", "PM"].map((m) => {
                    const active = meridiem === m;
                    return (
                        <button
                            key={m}
                            type="button"
                            onClick={() => {
                                setMeridiem(m);
                                emit(hour, minute, m);
                            }}
                            className={
                                "px-3 py-1.5 rounded-lg text-sm font-semibold transition " +
                                (active
                                    ? "bg-white/60 text-black shadow"
                                    : "text-[rgb(var(--text))] opacity-80 hover:opacity-100")
                            }
                        >
                            {m}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
