import { useState, useRef, useEffect } from "react";

const CAT_ICONS = {
    food: "🍽️", museums: "🏛️", nature: "🌿", shopping: "🛍️",
    nightlife: "🌙", landmarks: "🏙️", adventure: "⛰️",
};

const QUICK_PROMPTS = [
    "Move lunch to 12:00 PM",
    "Add a coffee break in the morning",
    "What's the best order to visit these?",
    "Swap Day 1 and Day 2 activities",
    "Which stop is closest to the airport?",
    "Add a sunset viewpoint on Day 3",
];

function TypingDots() {
    return (
        <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
            {[0, 1, 2].map((i) => (
                <div key={i} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: "rgba(167,139,250,0.8)",
                    animation: "typingBounce 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.18}s`,
                }} />
            ))}
            <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
        </div>
    );
}

function Message({ msg }) {
    const isUser = msg.role === "user";
    return (
        <div style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
            marginBottom: 12,
            animation: "msgIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
            {!isUser && (
                <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, marginRight: 8, marginTop: 2,
                    boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
                }}>✈️</div>
            )}
            <div style={{
                maxWidth: "75%",
                background: isUser
                    ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                    : "rgba(255,255,255,0.10)",
                backdropFilter: "blur(10px)",
                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px",
                color: "white",
                fontSize: 14,
                lineHeight: 1.55,
                border: isUser ? "none" : "1px solid rgba(255,255,255,0.12)",
                boxShadow: isUser ? "0 4px 20px rgba(124,58,237,0.35)" : "0 2px 8px rgba(0,0,0,0.2)",
                whiteSpace: "pre-wrap",
            }}>
                {msg.content}
            </div>
            <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        </div>
    );
}

export default function ItineraryChat({ itinerary, city, activeDay, onItineraryUpdate }) {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hey! I'm your TripWise AI ✈️\n\nI know your full ${city} itinerary — ask me anything! Move activities, find alternatives, reorder your day, or get local tips.`,
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasNew, setHasNew] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => inputRef.current?.focus(), 100);
            setHasNew(false);
        }
    }, [messages, isOpen]);

    function buildSystemPrompt() {
        const dayGroups = {};
        itinerary.forEach((item) => {
            const d = item.day ?? 1;
            if (!dayGroups[d]) dayGroups[d] = [];
            dayGroups[d].push(item);
        });

        const itineraryText = Object.entries(dayGroups)
            .map(([day, items]) =>
                `Day ${day}:\n` +
                items.map((it, i) =>
                    `  ${i + 1}. [${it.time || "?"}] ${it.name} (${it.category}) — ${it.address || "no address"}`
                ).join("\n")
            ).join("\n\n");

        return `You are TripWise AI, an expert travel assistant helping a user with their ${city} trip itinerary.

CURRENT ITINERARY:
${itineraryText}

INSTRUCTIONS:
- Help the user modify, optimize, or get info about their itinerary
- When suggesting time changes, be specific (e.g. "move Lunch to 12:30 PM")
- When suggesting reordering, explain why (proximity, opening hours, flow)
- Keep responses concise and actionable — 2-4 sentences max unless asked for more
- Be warm, enthusiastic, and knowledgeable about ${city}
- If user asks to swap/move/add activities, describe the updated schedule clearly
- You can suggest nearby alternatives if a place seems out of the way
- Current active day being viewed: Day ${activeDay}`;
    }

    async function sendMessage(text) {
        const userText = text || input.trim();
        if (!userText || loading) return;

        setInput("");
        const newMessages = [...messages, { role: "user", content: userText }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const apiMessages = newMessages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: buildSystemPrompt(),
                    messages: apiMessages,
                }),
            });

            const data = await res.json();
            const reply = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't process that.";

            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            if (!isOpen) setHasNew(true);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Oops, something went wrong. Please try again!" },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    return (
        <>
            {/* ── Floating bubble ── */}
            <button
                onClick={() => { setIsOpen(!isOpen); setHasNew(false); }}
                style={{
                    position: "fixed", bottom: 28, right: 28, zIndex: 1000,
                    width: 58, height: 58, borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                    boxShadow: "0 8px 32px rgba(124,58,237,0.55), 0 0 0 0 rgba(124,58,237,0.4)",
                    animation: isOpen ? "none" : "chatPulse 2.5s ease-in-out infinite",
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "scale(0.92) rotate(10deg)" : "scale(1)",
                }}
                title="Chat with TripWise AI"
            >
                {isOpen ? "✕" : "✈️"}
                {hasNew && !isOpen && (
                    <div style={{
                        position: "absolute", top: 4, right: 4,
                        width: 12, height: 12, borderRadius: "50%",
                        background: "#f97316", border: "2px solid #1a1a2e",
                    }} />
                )}
            </button>

            {/* ── Chat panel ── */}
            <div style={{
                position: "fixed", bottom: 100, right: 28, zIndex: 999,
                width: 360, height: 520,
                borderRadius: 24,
                background: "linear-gradient(160deg, rgba(20,10,40,0.97) 0%, rgba(10,10,30,0.97) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(124,58,237,0.35)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
                transform: isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? "auto" : "none",
                transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}>

                {/* Header */}
                <div style={{
                    padding: "16px 18px 12px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(124,58,237,0.15)",
                    flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 18, boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
                        }}>✈️</div>
                        <div>
                            <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>TripWise AI</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80" }} />
                                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Online · {city} expert</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
                        >×</button>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 4px", scrollbarWidth: "thin", scrollbarColor: "rgba(124,58,237,0.3) transparent" }}>
                    {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                    {loading && (
                        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 12 }}>
                            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0 }}>✈️</div>
                            <div style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "18px 18px 18px 4px", padding: "10px 14px" }}>
                                <TypingDots />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Quick prompts */}
                <div style={{ padding: "8px 12px 0", flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
                        {QUICK_PROMPTS.map((p) => (
                            <button
                                key={p}
                                onClick={() => sendMessage(p)}
                                disabled={loading}
                                style={{
                                    flexShrink: 0,
                                    background: "rgba(124,58,237,0.18)",
                                    border: "1px solid rgba(124,58,237,0.35)",
                                    borderRadius: 99,
                                    color: "rgba(167,139,250,0.9)",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "4px 10px",
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    transition: "background 0.15s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(124,58,237,0.35)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(124,58,237,0.18)"}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <div style={{ padding: "10px 12px 14px", flexShrink: 0 }}>
                    <div style={{
                        display: "flex", alignItems: "flex-end", gap: 8,
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 16,
                        padding: "8px 10px 8px 14px",
                    }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Ask me to adjust your itinerary…"
                            rows={1}
                            disabled={loading}
                            style={{
                                flex: 1, background: "transparent", border: "none", outline: "none",
                                color: "white", fontSize: 13, resize: "none",
                                lineHeight: 1.5, maxHeight: 80, overflowY: "auto",
                                fontFamily: "inherit",
                            }}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            style={{
                                width: 34, height: 34, borderRadius: "50%", border: "none",
                                background: input.trim() && !loading
                                    ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                                    : "rgba(255,255,255,0.08)",
                                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 15, flexShrink: 0,
                                transition: "all 0.2s ease",
                                boxShadow: input.trim() && !loading ? "0 4px 14px rgba(124,58,237,0.5)" : "none",
                            }}
                        >
                            {loading ? "⏳" : "↑"}
                        </button>
                    </div>
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 6 }}>
                        Powered by Claude · Enter to send
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(124,58,237,0.55), 0 0 0 0 rgba(124,58,237,0.4); }
          50% { box-shadow: 0 8px 32px rgba(124,58,237,0.55), 0 0 0 10px rgba(124,58,237,0); }
        }
      `}</style>
        </>
    );
}
