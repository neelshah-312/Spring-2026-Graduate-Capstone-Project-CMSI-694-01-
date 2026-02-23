import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {

    return (
        <header className="sticky top-0 z-50">
            <div className="backdrop-blur-xl bg-white/60 dark:bg-[rgb(var(--bg))]/70 border-b border-[rgb(var(--border))]">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary2))]" />
                        <span className="font-semibold text-[rgb(var(--text))]">TripWise</span>
                    </div>

                    <div className="navLeft">
                        <div className="logoBox"></div>
                        {/* <span className="logoText">TripWise</span> */}
                    </div>

                    {/* <div className="navCenter">
                        <Link to="/">Home</Link>
                        <Link to="#">About</Link>
                        <Link to="#">Destinations</Link>
                        <Link to="#">Contact</Link>
                    </div> */}

                    {/* <div className="navRight">
                        <Link to="/plan" className="planBtn">
                            Plan Trip
                        </Link>
                    </div> */}

                    <nav className="hidden md:flex items-center gap-7 text-sm text-[rgb(var(--muted))]">
                        <a className="hover:text-[rgb(var(--text))]" href="#">Home</a>
                        <a className="hover:text-[rgb(var(--text))]" href="#">About</a>
                        <a className="hover:text-[rgb(var(--text))]" href="#">Destinations</a>
                        <a className="hover:text-[rgb(var(--text))]" href="#">Contact</a>
                    </nav>

                    <Link
                        to="/plan"
                        className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary2))] shadow inline-block"
                    >
                        Plan Trip
                    </Link>
                </div>
            </div>
        </header>
    );
}