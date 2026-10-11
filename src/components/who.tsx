import { poster } from "@/lib/film";

type WhoProps = {
  accepted: boolean;
  onEnter: () => void;
};

export function Who({ accepted, onEnter }: WhoProps) {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg text-fg">
      <img
        src={poster}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="pointer-events-none absolute inset-0 bg-bg/75" />
      <div className="relative z-10 px-6 text-center">
        <h1 className="text-3xl font-medium tracking-tight md:text-5xl">Quem está assistindo?</h1>
        <button
          type="button"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            onEnter();
          }}
          onClick={onEnter}
          className="mt-10 touch-manipulation transition-transform duration-150 ease-out active:scale-[0.96]"
        >
          <span className="mx-auto grid size-28 place-items-center rounded-sm bg-red text-5xl font-semibold text-fg md:size-36">
            V
          </span>
          <span className="mt-3 block text-lg text-muted">Você</span>
          {accepted ? <span className="mt-1 block text-sm text-fg">disse sim</span> : null}
        </button>
      </div>
    </main>
  );
}
