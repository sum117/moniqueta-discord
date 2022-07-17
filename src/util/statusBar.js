export function statusBar(current, total, fill, empty) {
  const percentage = current / total;
  const progress = Math.round(5 * percentage);
  const emptyProgress = 5 - progress;
  const progressText = fill.repeat(progress);
  const emptyProgressText = empty.repeat(emptyProgress);
  const bar = progressText + emptyProgressText;
  return `${bar}`;
}
