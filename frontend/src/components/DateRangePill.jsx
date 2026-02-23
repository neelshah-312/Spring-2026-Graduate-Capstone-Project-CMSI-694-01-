import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

function fmt(d) {
    if (!d) return "";
    return format(d, "MM/dd/yyyy");
}

export default function DateRangePill({ start, end, onChange }) {
    const [open, setOpen] = useState(null); // "start" | "end" | null
    const wrapperRef = useRef(null);

    useEffect(() => {
        function onDocClick(e) {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target)) setOpen(null);
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, []);

    return (
        <div className="datePillWrap" ref={wrapperRef}>
            {/* Start */}
            <div className="pillField dateField">
                <div className="pillLabel">Start Date</div>
                <button
                    type="button"
                    className="dateButton"
                    onClick={() => setOpen(open === "start" ? null : "start")}
                >
                    {start ? fmt(start) : "Select"}
                </button>

                {open === "start" && (
                    <div className="datePopover">
                        <DayPicker
                            mode="single"
                            selected={start}
                            onSelect={(d) => {
                                onChange(d, end);
                                setOpen(null);
                            }}
                            disabled={{ before: new Date() }}
                        />
                    </div>
                )}
            </div>

            <div className="pillDivider" />

            {/* End */}
            <div className="pillField dateField">
                <div className="pillLabel">End Date</div>
                <button
                    type="button"
                    className="dateButton"
                    onClick={() => setOpen(open === "end" ? null : "end")}
                >
                    {end ? fmt(end) : "Select"}
                </button>

                {open === "end" && (
                    <div className="datePopover">
                        <DayPicker
                            mode="single"
                            selected={end}
                            onSelect={(d) => {
                                onChange(start, d);
                                setOpen(null);
                            }}
                            disabled={{
                                before: start || new Date(),
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
