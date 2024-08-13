import { formatDate } from "../../utils/date-utils.js";
import { getProgressBar } from "../../lib/spaced-repetition.js";

document.addEventListener("DOMContentLoaded", () => {
  loadProblems();
  setupDataManagement();
});

function loadProblems() {
  chrome.runtime.sendMessage({ action: "getAllProblems" }, (problems) => {
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

  document.querySelectorAll(".review-button").forEach((button) => {
    button.addEventListener("click", function () {
      const titleSlug = this.getAttribute("data-slug");
      reviewProblem(titleSlug);
    });
  });
}

function reviewProblem(titleSlug) {
  chrome.runtime.sendMessage({ action: "reviewProblem", titleSlug }, () => {
    loadProblems();
  });
}

function setupDataManagement() {
  document.getElementById("exportData").addEventListener("click", exportData);
  document
    .getElementById("importData")
    .addEventListener("click", () =>
      document.getElementById("fileInput").click()
    );
  document.getElementById("resetData").addEventListener("click", resetData);
  document.getElementById("fileInput").addEventListener("change", importData);
}

function exportData() {
  chrome.runtime.sendMessage({ action: "getAllProblems" }, (problems) => {
    const blob = new Blob(
      [JSON.stringify({ leetCodeProblems: problems }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leetcode_spaced_repetition_data.json";
    a.click();
    URL.revokeObjectURL(url);
  });
}

function importData(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.leetCodeProblems) {
          chrome.runtime.sendMessage(
            { action: "setAllProblems", problems: data.leetCodeProblems },
            () => {
              alert("Data imported successfully!");
              loadProblems();
            }
          );
        } else {
          throw new Error("Invalid data format");
        }
      } catch (error) {
        alert("Error importing data. Please make sure the file is valid.");
      }
    };
    reader.readAsText(file);
  }
}

function resetData() {
  if (
    confirm(
      "Are you sure you want to reset all data? This action cannot be undone."
    )
  ) {
    chrome.runtime.sendMessage({ action: "resetAllProblems" }, (response) => {
      if (response.success) {
        alert("All data has been reset.");
        loadProblems();
      } else {
        alert("Error resetting data. Please try again.");
      }
    });
  }
}
