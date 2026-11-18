import dayjs from "dayjs";

export const count = (v) => new Intl.NumberFormat("en-US").format(Number(v ?? 0));
export const compact = (v) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(Number(v ?? 0));
export const dayLabel = (v) => dayjs(v).format("MMM D");
export const stamp = (v) => (v ? dayjs(v).format("MMM D, HH:mm") : "none yet");
