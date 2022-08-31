export function statusBar(current, total, fill, empty, width = 5) {
  const percentage = current / total;
  const progress = Math.round(width * percentage);
  const emptyProgress = width - progress;
  const progressText = fill.repeat(progress >= 1 ? progress : 0);
  const emptyProgressText = empty.repeat(
    emptyProgress >= 1 ? emptyProgress : 0
  );
  const bar = progressText + emptyProgressText;
  return `${bar}`;
}
