import { canResume } from "@/lib/film";

const TIME_KEY = "andar-t";
const LIST_KEY = "andar-list";
const YES_KEY = "andar-sim";

export type Shelf = {
  progress: number;
  accepted: boolean;
  list: string[];
};

function readJson(raw: string): unknown {
  return JSON.parse(raw);
}

export function loadShelf(): Shelf {
  let progress = 0;
  const rawTime = localStorage.getItem(TIME_KEY);
  if (rawTime !== null) {
    const seconds = Number(rawTime);
    if (canResume(seconds)) progress = seconds;
  }

  let list: string[] = [];
  const rawList = localStorage.getItem(LIST_KEY);
  if (rawList) {
    try {
      const data = readJson(rawList);
      if (Array.isArray(data)) {
        list = data.filter((item): item is string => typeof item === "string");
      }
    } catch {
      list = [];
    }
  }

  return {
    progress,
    accepted: localStorage.getItem(YES_KEY) === "1",
    list,
  };
}

export function saveProgress(seconds: number) {
  if (!canResume(seconds)) return;
  localStorage.setItem(TIME_KEY, String(seconds));
}

export function clearProgress() {
  localStorage.removeItem(TIME_KEY);
}

export function saveList(ids: string[]) {
  localStorage.setItem(LIST_KEY, JSON.stringify(ids));
}

export function saveAccepted() {
  localStorage.setItem(YES_KEY, "1");
  clearProgress();
}
