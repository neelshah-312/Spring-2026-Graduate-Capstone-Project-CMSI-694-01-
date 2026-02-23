export default function ThemeToggle({ theme, setTheme }) {
    const isDark = theme === "dark";
    return (
        <button
            className="btnGhost"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title="Toggle theme"
        >
            {isDark ? "🌙 Dark" : "☀️ Light"}
        </button>
    );
}
