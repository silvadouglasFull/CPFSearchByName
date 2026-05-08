import type { LandingModule } from '@/components/landing/landing-modules.data';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface LandingModuleSectionProps {
    index: number;
    module: LandingModule;
}

export function LandingModuleSection({ index, module }: LandingModuleSectionProps) {
    const Icon = module.link.icon;
    const reverseLayout = index % 2 === 1;

    return (
        <section id={module.anchorId}>
            <Card className="overflow-hidden rounded-3xl scroll-mt-24 md:scroll-mt-28">
                <div
                    className={cn(
                        'grid gap-4 p-4 md:gap-6 md:p-6 lg:grid-cols-2',
                        reverseLayout && 'lg:[&>*:first-child]:order-2',
                    )}
                >
                    <div className="overflow-hidden rounded-2xl border bg-background">
                        <Link href={module.link.href}>
                            <Image
                                alt={`${module.link.label} module screen`}
                                className="h-auto w-full object-cover transition-opacity hover:opacity-95"
                                placeholder="blur"
                                priority={index < 2}
                                src={module.screen}
                            />
                        </Link>
                    </div>

                    <CardContent className="flex h-full flex-col justify-center space-y-4 p-2 md:p-4">
                        <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                                <Icon className="size-5" />
                                {module.copy.title}
                            </CardTitle>
                            <CardDescription className="text-sm md:text-base">{module.copy.summary}</CardDescription>
                        </div>

                        <ul className="space-y-1 text-sm text-muted-foreground">
                            {module.copy.bullets.map((bullet) => (
                                <li key={bullet}>- {bullet}</li>
                            ))}
                        </ul>

                        <div>
                            <Link
                                className="inline-flex items-center rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
                                href={module.link.href}
                            >
                                Open {module.link.label}
                            </Link>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </section>
    );
}
