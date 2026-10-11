import { Check, Play, Plus, X } from "lucide-react";
import { chapters, clock, poster, RUNTIME } from "@/lib/film";

type DetailProps = {
  list: string[];
  accepted: boolean;
  onToggleList: (id: string) => void;
  onClose: () => void;
  onPlay: (mode: "resume" | "start") => void;
  onPlayAt: (at: number) => void;
};

export function Detail({ list, accepted, onToggleList, onClose, onPlay, onPlayAt }: DetailProps) {
  const saved = chapters.filter((chapter) => list.includes(chapter.id)).length;

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg text-fg">
      <div className="relative h-72 sm:h-96">
        <img src={poster} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-bg to-transparent" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="safe-top absolute top-2 right-3 grid size-11 place-items-center bg-bg/70"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="safe-bottom mx-auto -mt-16 max-w-3xl px-4 pb-16 md:px-8">
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">
          {accepted ? "Disse sim" : "Para você"}
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">Filme</h2>
        <p className="mt-3 text-sm text-fg">2026 · {clock(RUNTIME)} · Romance</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onPlay("start")}
            className="inline-flex h-12 items-center justify-center gap-2 bg-fg px-6 font-semibold text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
          >
            <Play className="size-5 fill-current" aria-hidden="true" />
            Assistir
          </button>
          <p className="flex h-12 items-center text-sm text-muted">
            {saved ? `${saved} na sua lista` : "A música começa no play"}
          </p>
        </div>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-fg/90">
          Escreva aqui a sinopse.
        </p>
        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Com</dt>
            <dd className="mt-1 font-medium">Você</dd>
          </div>
          <div>
            <dt className="text-muted">De</dt>
            <dd className="mt-1 font-medium">Autor</dd>
          </div>
          <div>
            <dt className="text-muted">Música</dt>
            <dd className="mt-1 font-medium">Trilha</dd>
          </div>
          <div>
            <dt className="text-muted">Ocasião</dt>
            <dd className="mt-1 font-medium">Pedido de namoro</dd>
          </div>
        </dl>
        <h3 className="mt-10 text-lg font-semibold">Capítulos</h3>
        <ul className="mt-3 divide-y divide-surface">
          {chapters.map((chapter, index) => {
            const inList = list.includes(chapter.id);
            return (
              <li key={chapter.id} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() => onPlayAt(chapter.t)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="w-6 text-sm text-muted tabular-nums">{index + 1}</span>
                  <img src={chapter.image} alt="" className="h-14 w-24 object-cover" />
                  <span className="min-w-0">
                    <span className="block font-medium">{chapter.title}</span>
                    <span className="block truncate text-sm text-muted">{chapter.line}</span>
                  </span>
                </button>
                <span className="text-xs text-muted tabular-nums">{clock(chapter.t)}</span>
                <button
                  type="button"
                  aria-pressed={inList}
                  aria-label={inList ? `Tirar ${chapter.title} da lista` : `Salvar ${chapter.title}`}
                  onClick={() => onToggleList(chapter.id)}
                  className="grid size-11 place-items-center"
                >
                  {inList ? <Check className="size-5" /> : <Plus className="size-5" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
