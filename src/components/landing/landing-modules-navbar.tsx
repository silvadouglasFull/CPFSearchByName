import { BrandLogo } from '@/components/brand/brand-logo';
import type { LandingModule } from '@/components/landing/landing-modules.data';

interface LandingModulesNavbarProps {
    modules: LandingModule[];
}

export function LandingModulesNavbar({ modules }: LandingModulesNavbarProps) {
    return (
        <nav className="sticky top-0 z-20 hidden w-full border-b bg-background/90 backdrop-blur md:block">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 md:px-8">
                <BrandLogo />
                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                    {modules.map((module) => (
                        <a
                            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors hover:border-primary/40 hover:bg-primary/5 md:text-sm"
                            href={`#${module.anchorId}`}
                            key={module.link.href}
                        >
                            {module.link.label}
                        </a>
                    ))}
                </div>
            </div>
        </nav>
    );
}
