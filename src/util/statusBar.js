export function statusBar(current, total, fill, empty, width = 5) {
  const percentage = current / total;
  const progress = Math.round(width * percentage);
  const emptyProgress = width - progress;
  const progressText = fill.repeat(progress < 1 ? 0:emptyProgress);
  const emptyProgressText = empty?.repeat(emptyProgress < 1 ? 0:emptyProgress);
  const bar = progressText + emptyProgressText;
  return `${bar}`;
}
