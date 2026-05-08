import Link from 'next/link';

interface LegalPageProps {
  eyebrow?: string;
  children: React.ReactNode;
  title: string;
  updatedAt: string;
}

export function LegalPage({
  eyebrow = 'Documento legal',
  children,
  title,
  updatedAt,
}: LegalPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-10 md:px-8 md:py-14">
      <div className="mb-8 border-b pb-6">
        <Link
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          href="/"
        >
          Voltar para a pagina inicial
        </Link>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground">{eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="text-sm text-muted-foreground">Ultima atualizacao: {updatedAt}</p>
        </div>
      </div>

      <div className="space-y-4 text-sm leading-7 text-foreground/90 md:text-base [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2 [&_ul]:pl-1">
        {children}
      </div>
    </main>
  );
}