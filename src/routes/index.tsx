import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Browse } from "@/components/browse";
import { Detail } from "@/components/detail";
import { Player } from "@/components/player";
import { Who } from "@/components/who";
import { AUDIO_SRC, canResume } from "@/lib/film";
import { clearProgress, loadShelf, saveAccepted, saveList, saveProgress } from "@/lib/shelf";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const want = useRef(0);
  const nudgeUntil = useRef(0);
  const [who, setWho] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [detail, setDetail] = useState(false);
  const [progress, setProgress] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const shelf = loadShelf();
    setAccepted(shelf.accepted);
    setProgress(shelf.progress);
    setList(shelf.list);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nudge = () => {
      if (audio.readyState < 1 || performance.now() > nudgeUntil.current) return;
      if (want.current > 0.5 && audio.currentTime < 0.35) audio.currentTime = want.current;
    };
    audio.addEventListener("timeupdate", nudge);
    audio.addEventListener("playing", nudge);
    audio.addEventListener("loadedmetadata", nudge);
    audio.addEventListener("seeked", nudge);
    return () => {
      audio.removeEventListener("timeupdate", nudge);
      audio.removeEventListener("playing", nudge);
      audio.removeEventListener("loadedmetadata", nudge);
      audio.removeEventListener("seeked", nudge);
    };
  }, []);

  function hold(at: number) {
    const audio = audioRef.current;
    want.current = at;
    nudgeUntil.current = performance.now() + 1600;
    if (!audio || audio.readyState < 1) return;
    if (Math.abs(audio.currentTime - at) > 0.05) audio.currentTime = at;
  }

  function playFrom(at: number) {
    const audio = audioRef.current;
    if (!audio) return;
    setBlocked(false);
    setDetail(false);
    setPlaying(true);
    hold(at);
    const pending = audio.play();
    if (pending) pending.catch(() => setBlocked(true));
  }

  function assistir(mode: "resume" | "start") {
    playFrom(mode === "resume" && canResume(progress) ? progress : 0);
  }

  function closePlayer(finished: boolean) {
    const audio = audioRef.current;
    const at = audio?.currentTime ?? 0;
    audio?.pause();
    if (!finished && canResume(at)) {
      saveProgress(at);
      setProgress(at);
    } else {
      clearProgress();
      setProgress(0);
    }
    setPlaying(false);
    setBlocked(false);
  }

  function toggleList(id: string) {
    const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    setList(next);
    saveList(next);
  }

  function accept() {
    saveAccepted();
    setAccepted(true);
    setProgress(0);
  }

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} preload="auto" />
      {who ? (
        <Who accepted={accepted} onEnter={() => setWho(false)} />
      ) : (
        <Browse
          progress={progress}
          accepted={accepted}
          list={list}
          onToggleList={toggleList}
          onPlay={assistir}
          onPlayAt={playFrom}
          onOpenDetail={() => setDetail(true)}
          onWho={() => setWho(true)}
        />
      )}
      {detail && !who ? (
        <Detail
          list={list}
          accepted={accepted}
          onToggleList={toggleList}
          onClose={() => setDetail(false)}
          onPlay={assistir}
          onPlayAt={playFrom}
        />
      ) : null}
      {playing ? (
        <Player
          audioRef={audioRef}
          blocked={blocked}
          onUnblock={() => setBlocked(false)}
          onClose={closePlayer}
          onAccept={accept}
          onHold={hold}
          onProgress={setProgress}
        />
      ) : null}
    </>
  );
}