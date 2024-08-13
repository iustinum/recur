export function calculateNextReview(lastReview, reviewCount) {
  const intervalInDays = Math.pow(2, reviewCount);
  return lastReview + intervalInDays * 24 * 60 * 60 * 1000;
}

export function getProgressBar(reviewCount) {
  const maxReviews = 5; // 5 reviews is considered "mastery"
  const progress = Math.min((reviewCount / maxReviews) * 100, 100);
  const barColor = progress === 100 ? "#FFD700" : "#4CAF50"; // Gold for mastered, green otherwise
  return `<div class="progress-bar" style="width: ${progress}%; background-color: ${barColor};"></div>`;
}