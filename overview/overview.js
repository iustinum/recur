document.addEventListener("DOMContentLoaded", () => {
  loadProblems();
});

function loadProblems() {
  chrome.storage.local.get("problems", (data) => {
    const problems = data.problems || {};
    const sortedProblems = Object.values(problems).sort(
      (a, b) => a.nextReview - b.nextReview
    );
    updateStats(problems);
    displayProblems(sortedProblems);
  });
}

function updateStats(problems) {
  const totalProblems = Object.keys(problems).length;
  document.getElementById(
    "totalProblems"
  ).textContent = `Total Problems: ${totalProblems}`;

  const masteredProblems = Object.values(problems).filter(
    (p) => (p.reviewCount || 0) >= 5
  ).length;
  const masteryPercentage =
    totalProblems > 0 ? (masteredProblems / totalProblems) * 100 : 0;
  document.getElementById(
    "masteryProgress"
  ).textContent = `Mastery Progress: ${masteryPercentage.toFixed(2)}%`;
}

function displayProblems(problems) {
  const problemList = document.getElementById("problemList");
  problemList.innerHTML = "";

  problems.forEach((problem) => {
    const row = document.createElement("tr");
    const reviewCount = problem.reviewCount || 0;
    const isMastered = reviewCount >= 5;

    row.innerHTML = `
      <td>${problem.title}</td>
      <td>${problem.difficulty}</td>
      <td>${reviewCount}</td>
      <td>${getProgressBar(reviewCount)}</td>
      <td>${formatDate(problem.nextReview)}</td>
      <td>
        <button class="review-button" data-slug="${problem.titleSlug}" ${
      isMastered ? "disabled" : ""
    }>
          ${isMastered ? "Mastered" : "Review"}
        </button>
      </td>
    `;

    problemList.appendChild(row);
  });

  // Add event listeners to all review buttons
  document.querySelectorAll(".review-button").forEach((button) => {
    button.addEventListener("click", function () {
      const titleSlug = this.getAttribute("data-slug");
      reviewProblem(titleSlug);
    });
  });
}

function reviewProblem(titleSlug) {
  chrome.storage.local.get("problems", (data) => {
    const problems = data.problems || {};
    const problem = problems[titleSlug];
    if (problem) {
      chrome.tabs.create({ url: problem.url });
      chrome.runtime.sendMessage(
        { action: "updateProblemReview", titleSlug: titleSlug },
        () => {
          // Refresh the list after updating the problem
          loadProblems();
        }
      );
    }
  });
}

// helper functions

function getProgressBar(reviewCount) {
  const maxReviews = 5; // 5 reviews is considered "mastery"
  const progress = Math.min((reviewCount / maxReviews) * 100, 100);
  const barColor = progress === 100 ? "#FFD700" : "#4CAF50"; // Gold for mastered, green otherwise
  return `<div class="progress-bar" style="width: ${progress}%; background-color: ${barColor};"></div>`;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString();
}
