export default function GlassPage({ children }) {
    return (
        <div
            className="min-h-[calc(100vh-72px)] w-full bg-cover bg-center"
            style={{
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2400&q=80')",
            }}
        >
            <div className="min-h-[calc(100vh-72px)] w-full bg-black/10">
                <div className="mx-auto max-w-6xl px-6 py-12">
                    <div className="rounded-[32px] border border-white/30 bg-white/10 backdrop-blur-2xl shadow-2xl">
                        <div className="p-8 md:p-10">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}