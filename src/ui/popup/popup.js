import { formatDate } from "../../utils/date-utils.js";

document.addEventListener("DOMContentLoaded", () => {
  loadNextReview();
  setupOverviewButton();
});

function loadNextReview() {
  chrome.runtime.sendMessage({ action: "getNextReviewProblem" }, (problem) => {
    if (problem) {
      displayProblem(problem);
    } else {
      displayNoReview();
    }
  });
}

function displayProblem(problem) {
  document.getElementById("problemTitle").textContent = problem.title;
  document.getElementById("problemDifficulty").textContent = problem.difficulty;
  const nextReviewDate = problem.nextReview
    ? formatDate(problem.nextReview)
    : "Not set";
  document.getElementById(
    "nextReviewDate"
  ).textContent = `Next review: ${nextReviewDate}`;
  const reviewButton = document.getElementById("reviewButton");
  reviewButton.style.display = "block";
  reviewButton.addEventListener("click", () => reviewProblem(problem));
}

function displayNoReview() {
  document.getElementById("nextReview").innerHTML =
    "<p>No problems to review at this time.</p>";
  document.getElementById("reviewButton").style.display = "none";
}

function reviewProblem(problem) {
  chrome.tabs.create({ url: problem.url });
  chrome.runtime.sendMessage(
    { action: "reviewProblem", titleSlug: problem.titleSlug },
    () => {
      window.close();
    }
  );
}

function setupOverviewButton() {
  document.getElementById("overviewButton").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("overview.html") });
  });
}
