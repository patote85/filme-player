import { useEffect, useRef, useState, type RefObject } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import clsx from "clsx";
import { atAsk, atTime, canResume, clock, lyrics, replies, replyHref, RUNTIME, scenes } from "@/lib/film";
import { clearProgress, saveProgress } from "@/lib/shelf";

type PlayerProps = {
  audioRef: RefObject<HTMLAudioElement | null>;
  blocked: boolean;
  onUnblock: () => void;
  onClose: (finished: boolean) => void;
  onAccept: () => void;
  onHold: (at: number) => void;
  onProgress: (time: number) => void;
};

export function Player({
  audioRef,
  blocked,
  onUnblock,
  onClose,
  onAccept,
  onHold,
  onProgress,
}: PlayerProps) {
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(RUNTIME);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [yes, setYes] = useState(false);
  const [muted, setMuted] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [tick, setTick] = useState(0);
  const scrubbing = useRef(false);
  const holdUntil = useRef(0);
  const endedRef = useRef(false);
  const rangeRef = useRef<HTMLInputElement>(null);
  const onProgressRef = useRef(onProgress);
  const onCloseRef = useRef(onClose);
  const onHoldRef = useRef(onHold);
  const finishRef = useRef<() => void>(() => {});
  const toggleRef = useRef<() => void>(() => {});
  onProgressRef.current = onProgress;
  onCloseRef.current = onClose;
  onHoldRef.current = onHold;

  const scene = atTime(scenes, time);
  const line = atTime(lyrics, time);

  function paint(next: number, cap: number) {
    const node = rangeRef.current;
    if (!node || cap <= 0) return;
    node.style.setProperty("--p", `${Math.min(100, (next / cap) * 100)}%`);
    if (!scrubbing.current) node.value = String(Math.min(next, cap));
  }

  function finish() {
    if (endedRef.current) return;
    endedRef.current = true;
    audioRef.current?.pause();
    setEnded(true);
    setChrome(true);
    clearProgress();
    onProgressRef.current(0);
  }

  finishRef.current = finish;

  function close() {
    onCloseRef.current(endedRef.current);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let savedSecond = -1;
    const onTime = () => {
      if (scrubbing.current || performance.now() < holdUntil.current || endedRef.current) return;
      const next = audio.currentTime;
      const cap = Number.isFinite(audio.duration) ? audio.duration : RUNTIME;
      if (atAsk(next) || (cap > 0 && next >= cap - 0.25)) {
        finishRef.current();
        return;
      }
      setTime(next);
      paint(next, cap);
      const second = Math.floor(next);
      if (second === savedSecond) return;
      savedSecond = second;
      if (canResume(next)) saveProgress(next);
    };
    const onMeta = () => {
      if (!Number.isFinite(audio.duration)) return;
      setDuration(audio.duration);
      if (rangeRef.current) rangeRef.current.max = String(audio.duration);
    };
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    const onEnd = () => finishRef.current();

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnd);
    onMeta();
    setPaused(audio.paused);
    setTime(audio.currentTime);
    paint(audio.currentTime, Number.isFinite(audio.duration) ? audio.duration : RUNTIME);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnd);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!chrome || ended || paused || blocked) return;
    const id = window.setTimeout(() => setChrome(false), 3500);
    return () => window.clearTimeout(id);
  }, [chrome, ended, paused, blocked, tick]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === "Escape") onCloseRef.current(endedRef.current);
      if (event.key === " ") {
        event.preventDefault();
        toggleRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function poke() {
    setChrome(true);
    setTick((value) => value + 1);
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio || endedRef.current) return;
    if (audio.paused) {
      onHoldRef.current(audio.currentTime);
      const pending = audio.play();
      if (pending) pending.then(onUnblock).catch(() => undefined);
    } else {
      audio.pause();
    }
    poke();
  }

  toggleRef.current = toggle;

  function seek(value: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const cap = Number.isFinite(audio.duration) ? audio.duration : duration;
    const next = Math.min(Math.max(0, value), cap || value);
    holdUntil.current = performance.now() + 700;
    if (atAsk(next) || (cap > 0 && next >= cap - 0.25)) {
      onHoldRef.current(next);
      setTime(next);
      finish();
      return;
    }
    if (endedRef.current) {
      endedRef.current = false;
      setEnded(false);
    }
    onHoldRef.current(next);
    setTime(next);
    paint(next, cap);
    poke();
  }

  function choose(accept: boolean) {
    if (accept) onAccept();
    setYes(accept);
  }

  function retry() {
    const audio = audioRef.current;
    if (!audio) return;
    onHoldRef.current(audio.currentTime);
    const pending = audio.play();
    if (pending) pending.then(onUnblock).catch(() => undefined);
  }

  function replay() {
    const audio = audioRef.current;
    if (!audio) return;
    endedRef.current = false;
    setEnded(false);
    setYes(false);
    onHoldRef.current(0);
    setTime(0);
    const pending = audio.play();
    if (pending) pending.then(onUnblock).catch(() => undefined);
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Filme" className="fixed inset-0 z-50 bg-bg text-fg">
      {scenes.map((item) => (
        <img
          key={item.t}
          src={item.image}
          alt=""
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            scene.t === item.t ? "opacity-100" : "opacity-0",
            scene.t === item.t && "kenburns",
          )}
        />
      ))}
      <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/20 to-bg/50" />
      <button
        type="button"
        className="absolute inset-0"
        aria-label={chrome ? "Esconder controles" : "Mostrar controles"}
        onClick={() => (chrome ? setChrome(false) : poke())}
      />

      <div
        className={clsx(
          "safe-top absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-2 transition-opacity duration-200",
          chrome || ended ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <button type="button" onClick={close} aria-label="Voltar" className="grid size-11 place-items-center">
          <X className="size-6" />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Filme</p>
          <p className="truncate text-xs text-muted">Filme</p>
        </div>
      </div>

      {!ended && line.line ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 px-6 text-center md:bottom-32">
          <p key={`${line.t}-${line.line}`} className="lyric mx-auto max-w-lg text-2xl leading-snug font-medium md:text-4xl">
            {line.line}
          </p>
        </div>
      ) : null}

      {ended ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/80 px-6 text-center">
          {yes ? (
            <div className="max-w-md">
              <p className="text-xs font-semibold tracking-widest text-muted uppercase">Filme</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">Então é nós dois.</h2>
              <p className="mt-5 text-lg text-fg/85">Eu não vou me cansar.</p>
              <button
                type="button"
                onClick={close}
                className="mt-10 inline-flex h-12 w-full max-w-xs items-center justify-center bg-fg px-6 font-semibold text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
              >
                Voltar
              </button>
            </div>
          ) : (
            <div className="max-w-md">
              <p className="text-xs font-semibold tracking-widest text-muted uppercase">Pedido</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
                Quer namorar comigo?
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-fg/85">
                Eu quero ser o seu porto, a sua paz.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                {replies.map((reply) => (
                  <a
                    key={reply.text}
                    href={replyHref(reply.text)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => choose(reply.yes)}
                    className="inline-flex h-12 w-full max-w-xs items-center justify-center bg-fg px-6 font-semibold text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
                  >
                    {reply.text}
                  </a>
                ))}
              </div>
              <button
                type="button"
                onClick={replay}
                className="mt-4 flex min-h-11 w-full items-center justify-center text-sm text-muted"
              >
                Ouvir de novo
              </button>
            </div>
          )}
        </div>
      ) : null}

      {blocked && !ended ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-bg/70 px-6">
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-12 items-center gap-2 bg-fg px-6 font-semibold text-bg"
          >
            <Play className="size-5 fill-current" aria-hidden="true" />
            Tocar a música
          </button>
        </div>
      ) : null}

      <div
        className={clsx(
          "safe-bottom absolute inset-x-0 bottom-0 z-30 px-4 transition-opacity duration-200 md:px-10",
          chrome && !ended ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <label className="block">
          <span className="sr-only">Posição na música</span>
          <input
            ref={rangeRef}
            className="scrub"
            type="range"
            min={0}
            max={duration}
            step={0.1}
            defaultValue={0}
            onPointerDown={() => {
              scrubbing.current = true;
            }}
            onPointerUp={() => {
              scrubbing.current = false;
            }}
            onPointerCancel={() => {
              scrubbing.current = false;
            }}
            onInput={(event) => seek(Number(event.currentTarget.value))}
          />
        </label>
        <div className="mt-3 flex items-center gap-2 pb-3">
          <button type="button" onClick={toggle} aria-label={paused ? "Tocar" : "Pausar"} className="grid size-11 place-items-center">
            {paused ? <Play className="size-6 fill-current" /> : <Pause className="size-6 fill-current" />}
          </button>
          <button
            type="button"
            aria-label="Voltar 10 segundos"
            onClick={() => seek(Math.max(0, time - 10))}
            className="grid size-11 place-items-center"
          >
            <RotateCcw className="size-5" />
          </button>
          <p className="text-xs text-muted tabular-nums">
            {clock(time)} / {clock(duration)}
          </p>
          <button
            type="button"
            className="ml-auto grid size-11 place-items-center"
            aria-label={muted ? "Ativar som" : "Silenciar"}
            onClick={() => {
              const audio = audioRef.current;
              if (!audio) return;
              audio.muted = !audio.muted;
              setMuted(audio.muted);
              poke();
            }}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
