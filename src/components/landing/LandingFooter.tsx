import Link from "next/link";
import { Bot } from "lucide-react";

export default function LandingFooter() {
    return (
        <footer className="border-t">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <Bot />
                    <p className="text-center text-sm leading-loose md:text-left">
                        Built by You. The code is available on{" "}
                        <Link href="https://github.com" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">
                            GitHub
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </footer>
    )
}