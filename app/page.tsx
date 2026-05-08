import { LandingHero } from '@/components/landing/landing-hero';
import { LandingModuleSection } from '@/components/landing/landing-module-section';
import { LandingModulesNavbar } from '@/components/landing/landing-modules-navbar';
import { LANDING_MODULES } from '@/components/landing/landing-modules.data';

export default function HomePage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <LandingModulesNavbar modules={LANDING_MODULES} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
        <LandingHero />

        <section className="space-y-6 md:space-y-8">
          {LANDING_MODULES.map((module, index) => (
            <LandingModuleSection index={index} key={module.link.href} module={module} />
          ))}
        </section>
      </main>
    </div>
  );
}
