import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Info, Play, Plus, Search, X } from "lucide-react";
import clsx from "clsx";
import { canResume, chapters, clock, fold, poster, RUNTIME, type Chapter } from "@/lib/film";

type BrowseProps = {
  progress: number;
  accepted: boolean;
  list: string[];
  onToggleList: (id: string) => void;
  onPlay: (mode: "resume" | "start") => void;
  onPlayAt: (at: number) => void;
  onOpenDetail: () => void;
  onWho: () => void;
};

export function Browse({
  progress,
  accepted,
  list,
  onToggleList,
  onPlay,
  onPlayAt,
  onOpenDetail,
  onWho,
}: BrowseProps) {
  const [solid, setSolid] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const resume = canResume(progress);
  const saved = chapters.filter((chapter) => list.includes(chapter.id));
  const q = fold(query.trim());

  const foundChapters = useMemo(() => {
    if (!q) return chapters;
    return chapters.filter((chapter) => fold(`${chapter.title} ${chapter.line}`).includes(q));
  }, [q]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <header
        className={clsx(
          "safe-top fixed inset-x-0 top-0 z-30 flex items-center gap-4 px-4 pb-3 transition-colors duration-200 md:px-12",
          solid || searchOpen ? "bg-bg" : "bg-linear-to-b from-bg to-transparent",
        )}
      >
        <p className="text-2xl font-extrabold tracking-tight text-red">FL</p>
        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <button type="button" className="text-fg" onClick={() => window.scrollTo({ top: 0 })}>
            Início
          </button>
          <button type="button" onClick={onOpenDetail}>
            Filme
          </button>
          <button
            type="button"
            onClick={() => document.getElementById("capitulos")?.scrollIntoView({ behavior: "smooth" })}
          >
            Capítulos
          </button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {searchOpen ? (
            <label className="flex h-11 items-center gap-2 bg-surface px-3">
              <Search className="size-4 text-muted" aria-hidden="true" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar no filme"
                className="w-36 bg-transparent text-sm text-fg outline-none md:w-56"
                aria-label="Buscar no filme"
              />
              <button
                type="button"
                aria-label="Fechar busca"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
              >
                <X className="size-4" />
              </button>
            </label>
          ) : (
            <button
              type="button"
              className="grid size-11 place-items-center"
              aria-label="Buscar"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Perfil"
            onClick={onWho}
            className="grid size-11 place-items-center"
          >
            <span className="grid size-8 place-items-center bg-red text-sm font-semibold">D</span>
          </button>
        </div>
      </header>

      <section className="relative min-h-dvh">
        <img
          src={poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/25 to-bg/55" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-bg via-bg/20 to-transparent md:block" />
        <div className="relative flex min-h-dvh flex-col justify-end px-4 pt-24 pb-8 md:max-w-xl md:px-12 md:pb-20">
          <p className="text-xs font-semibold tracking-widest text-fg uppercase">
            {accepted ? "Disse sim" : "Filme"}
          </p>
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight md:text-7xl">Filme</h1>
          <p className="mt-3 text-sm font-medium text-fg">2026 · {clock(RUNTIME)} · Romance</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-fg/90">
            Escreva aqui a sinopse.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onPlay(resume ? "resume" : "start")}
              className="inline-flex h-12 items-center justify-center gap-2 bg-fg px-6 font-semibold text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <Play className="size-5 fill-current" aria-hidden="true" />
              {resume ? `Continuar · ${clock(progress)}` : "Assistir"}
            </button>
            <button
              type="button"
              onClick={onOpenDetail}
              className="inline-flex h-12 items-center justify-center gap-2 bg-surface px-5 font-semibold text-fg transition-transform duration-150 ease-out active:scale-[0.96]"
            >
              <Info className="size-5" aria-hidden="true" />
              Mais informações
            </button>
          </div>
          {resume ? (
            <button
              type="button"
              onClick={() => onPlay("start")}
              className="mt-4 self-start text-sm text-muted"
            >
              Assistir do começo
            </button>
          ) : null}
        </div>
      </section>

      <div className="relative z-10 -mt-2 space-y-8 pb-6">
        {q ? (
          <section className="space-y-8" aria-live="polite">
            <Row title={foundChapters.length ? "Capítulos" : "Nada nos capítulos"}>
              {foundChapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  saved={list.includes(chapter.id)}
                  onPlay={() => onPlayAt(chapter.t)}
                  onToggle={() => onToggleList(chapter.id)}
                />
              ))}
            </Row>
          </section>
        ) : (
          <>
            {resume ? (
              <Row title="Continuar assistindo">
                <button
                  type="button"
                  onClick={() => onPlay("resume")}
                  className="w-64 shrink-0 snap-start text-left sm:w-80"
                >
                  <span className="relative block overflow-hidden">
                    <img src={poster} alt="" className="card-still" />
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-fg/30">
                      <span
                        className="block h-full bg-red"
                        style={{ width: `${Math.min(100, (progress / RUNTIME) * 100)}%` }}
                      />
                    </span>
                  </span>
                  <span className="mt-2 block text-sm font-medium">Filme</span>
                  <span className="block text-xs text-muted">{clock(progress)} de {clock(RUNTIME)}</span>
                </button>
              </Row>
            ) : null}

            {saved.length ? (
              <Row title="Minha lista">
                {saved.map((chapter) => (
                  <ChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    saved
                    onPlay={() => onPlayAt(chapter.t)}
                    onToggle={() => onToggleList(chapter.id)}
                  />
                ))}
              </Row>
            ) : null}

            <Row title="Capítulos" id="capitulos">
              {chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  saved={list.includes(chapter.id)}
                  onPlay={() => onPlayAt(chapter.t)}
                  onToggle={() => onToggleList(chapter.id)}
                />
              ))}
            </Row>
          </>
        )}
      </div>

      <footer className="px-4 py-16 text-sm text-muted md:px-12">
        <p className="font-medium text-fg">Filme</p>
        <p className="mt-1">Um filme.</p>
      </footer>
    </main>
  );
}

function Row({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 px-4 text-lg font-semibold md:px-12">{title}</h2>
      <div className="row-scroll">{children}</div>
    </section>
  );
}

function ChapterCard({
  chapter,
  saved,
  onPlay,
  onToggle,
}: {
  chapter: Chapter;
  saved: boolean;
  onPlay: () => void;
  onToggle: () => void;
}) {
  return (
    <article className="w-64 shrink-0 snap-start sm:w-72">
      <div className="relative">
        <button type="button" onClick={onPlay} className="block w-full text-left">
          <img src={chapter.image} alt={chapter.title} className="card-still" />
        </button>
        <button
          type="button"
          aria-label={saved ? `Tirar ${chapter.title} da lista` : `Salvar ${chapter.title}`}
          aria-pressed={saved}
          onClick={onToggle}
          className="absolute top-2 right-2 grid size-11 place-items-center bg-bg/80"
        >
          {saved ? <Check className="size-5" /> : <Plus className="size-5" />}
        </button>
      </div>
      <button type="button" onClick={onPlay} className="mt-2 block text-left">
        <span className="block text-sm font-medium">{chapter.title}</span>
        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted">
          {chapter.line}
        </span>
      </button>
    </article>
  );
}
