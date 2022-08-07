export function statusBar(current, total, fill, empty, width = 5) {
  const percentage = current / total;
  const progress = Math.round(width * percentage);
  const emptyProgress = width - progress;
  const progressText = fill.repeat(progress);
  const emptyProgressText = empty.repeat(emptyProgress);
  const bar = progressText + emptyProgressText;
  return `${bar}`;
}
