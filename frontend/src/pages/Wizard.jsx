import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StepBar from "../components/StepBar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import { PrimaryButton, SecondaryButton } from "../components/PrimaryButton.jsx";
import { generateTrip } from "../lib/api";

const INTERESTS = [
  { key: "food", label: "Food", emoji: "🍜" },
  { key: "landmarks", label: "Landmarks", emoji: "🏛️" },
  { key: "museums", label: "Museums", emoji: "🖼️" },
  { key: "nature", label: "Nature", emoji: "🌿" },
  { key: "shopping", label: "Shopping", emoji: "🛍️" },
  { key: "nightlife", label: "Nightlife", emoji: "🌙" },
  { key: "adventure", label: "Adventure", emoji: "🧗" },
];

function Background() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-pink-400/40 to-orange-300/30 blur-2xl" />
      <div className="absolute top-20 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-indigo-400/30 to-cyan-300/30 blur-2xl" />
      <div className="absolute bottom-[-200px] left-1/3 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-emerald-400/25 to-lime-300/20 blur-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_50%)]" />
    </div>
  );
}

export default function Wizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);

  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [interests, setInterests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const canNext = useMemo(() => {
    if (step === 1) return city.trim().length > 0;
    if (step === 2) return !!startDate && !!endDate;
    if (step === 3) return travelers >= 1;
    return true;
  }, [step, city, startDate, endDate, travelers]);

  function toggleInterest(k) {
    setInterests((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  async function onGenerate() {
    setErr("");
    setLoading(true);
    try {
      const res = await generateTrip({
        city,
        startDate,
        endDate,
        travelers,
        interests,
      });
      nav(`/trip/${res.tripId}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <Background />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">TripWise</h1>
            <p className="text-black/60 mt-1">
              Smooth trip planning — wizard → itinerary → map
            </p>
          </div>
          <div className="text-sm text-black/50">Sprint 1 MVP</div>
        </div>

        <div className="mt-6">
          <StepBar step={step} total={4} />
        </div>

        <GlassCard className="mt-6 p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold">Where to?</div>
                <div className="text-black/60 text-sm mt-1">
                  Enter a city (example: Paris, New York, Tokyo)
                </div>
              </div>

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City name..."
                className="w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold">When?</div>
                <div className="text-black/60 text-sm mt-1">
                  Choose trip dates
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-black/60">Start date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-black/60">End date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold">Who’s going?</div>
                <div className="text-black/60 text-sm mt-1">
                  Set number of travelers
                </div>
              </div>

              <div className="flex items-center gap-3">
                <SecondaryButton
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                >
                  −
                </SecondaryButton>

                <div className="rounded-2xl bg-black/5 px-5 py-3 font-semibold">
                  {travelers} traveler(s)
                </div>

                <SecondaryButton onClick={() => setTravelers((t) => t + 1)}>
                  +
                </SecondaryButton>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <div className="text-xl font-semibold">Interests</div>
                <div className="text-black/60 text-sm mt-1">
                  Pick what you like (optional)
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {INTERESTS.map((i) => {
                  const active = interests.includes(i.key);
                  return (
                    <button
                      key={i.key}
                      onClick={() => toggleInterest(i.key)}
                      className={`text-left rounded-2xl p-4 border transition ${active
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white hover:bg-black/5"
                        }`}
                    >
                      <div className="text-2xl">{i.emoji}</div>
                      <div className="mt-2 font-semibold">{i.label}</div>
                      <div
                        className={`text-sm mt-1 ${active ? "text-white/70" : "text-black/60"
                          }`}
                      >
                        Add {i.label.toLowerCase()} picks
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-black/50">
                If none selected, TripWise will auto-pick: landmarks + food + museums.
              </div>
            </div>
          )}

          {err && (
            <div className="mt-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl p-3">
              {err}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <SecondaryButton
              disabled={step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </SecondaryButton>

            {step < 4 ? (
              <PrimaryButton disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Next
              </PrimaryButton>
            ) : (
              <PrimaryButton
                disabled={loading || !city || !startDate || !endDate}
                onClick={onGenerate}
              >
                {loading ? "Generating..." : "Generate Itinerary"}
              </PrimaryButton>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
