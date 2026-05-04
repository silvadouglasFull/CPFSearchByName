import { NAVIGATION_LINKS } from '@/components/navigation/navigation-links';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
      <section className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm md:p-10">
        <p className="text-sm text-muted-foreground">Home</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">Welcome to verifyDocs</h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Use the sidebar to navigate across all pages in the application. On small screens, open the menu with
          the hamburger button in the top bar.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {NAVIGATION_LINKS.map((link) => {
          const Icon = link.icon;

          return (
            <Link href={link.href} key={link.href}>
              <Card className="h-full rounded-3xl transition-colors hover:border-primary/40 hover:bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="size-4" />
                    {link.label}
                  </CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">Open page</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
