import { cn } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';

interface BrandLogoProps {
    className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
    return (
        <span className={cn('flex shrink-0 items-center gap-2', className)}>
            <ShieldCheck className="size-6 text-primary md:size-7" />
            <span className="w-max">
                <p className="flex w-full justify-between gap-[0.18em] text-base font-semibold leading-none md:text-lg">
                    {'verifyDocs'.split('').map((char, i) => (
                        <span key={i}>{char}</span>
                    ))}
                </p>
                <small className="text-[9px] text-muted-foreground md:text-[10px]">
                    CPF Authenticity &amp; Fraud Prevention
                </small>
            </span>
        </span>
    );
}
