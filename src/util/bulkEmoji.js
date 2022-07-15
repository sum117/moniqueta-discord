export function bulkEmoji(msg, Array) {
    for (let each of Array)
        msg.react(each);
}



