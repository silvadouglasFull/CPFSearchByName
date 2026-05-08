import Link from "next/link";

export function LandingFooter() {
    return (
        <footer className="border-t pt-6 text-sm text-muted-foreground">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    <span>
                        <Link className="transition-colors hover:text-foreground" href="https://dswebdev.com.br/">
                            DS Web Dev
                        </Link>
                        {' '} © 2026
                    </span>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Link className="transition-colors hover:text-foreground" href="/privacy-policy">
                        Privacy Policy
                    </Link>
                    <Link className="transition-colors hover:text-foreground" href="/terms-of-use">
                        Terms of Use
                    </Link>
                    <Link className="transition-colors hover:text-foreground" href="/contact">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    )
}