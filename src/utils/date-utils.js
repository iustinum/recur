export function formatDate(timestamp) {
  if (!timestamp || isNaN(new Date(timestamp).getTime())) {
    return "Invalid Date";
  }
  return new Date(timestamp).toLocaleDateString();
}
