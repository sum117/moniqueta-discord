export function bulkEmoji(msg, Array) {
  for (const each of Array) msg.react(each);
}
