export function statusBar(current, total, fill, empty) {
    let percentage = current / total;
    let progress = Math.round(5 * percentage);
    let emptyProgress = 5 - progress;
    let progressText = fill.repeat(progress);
    let emptyProgressText = empty.repeat(emptyProgress);
    let bar = progressText + emptyProgressText;
    return `${bar}`;
}

