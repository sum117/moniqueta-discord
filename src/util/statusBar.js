export function statusBar(current, total, fill, empty, width = 5) {
  const percentage = current / total;
  const progress = Math.round(width * percentage);
  const emptyProgress = width - progress || 0;
  const progressText = fill.repeat(progress);
  const emptyProgressText = empty >= 1 ? empty.repeat(emptyProgress) : '';
  const bar = progressText + emptyProgressText;
  return `${bar}`;
}
