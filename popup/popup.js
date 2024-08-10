document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: "getNextReview" }, (problem) => {
    if (problem) {
      document.getElementById('problemTitle').textContent = problem.title;
      document.getElementById('problemDifficulty').textContent = problem.difficulty;
      document.getElementById('reviewButton').addEventListener('click', () => {
        chrome.tabs.create({ url: problem.url });
      });
    } else {
      document.getElementById('nextReview').innerHTML = "<p>No problems to review at this time.</p>";
    }
  });

  document.getElementById('overviewButton').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('overview/overview.html') });
  });
});