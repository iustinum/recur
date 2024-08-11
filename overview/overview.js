document.addEventListener("DOMContentLoaded", () => {
  loadProblems();
  setupDataManagement();
});

function loadProblems() {
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    const problems = data.leetCodeProblems || {};
    const sortedProblems = Object.values(problems).sort(
      (a, b) => a.nextReview - b.nextReview
    );
    updateStats(problems);
    displayProblems(sortedProblems);
  });
}

function setupDataManagement() {
  const exportButton = document.getElementById("exportData");
  const importButton = document.getElementById("importData");
  const resetButton = document.getElementById('resetData');
  const fileInput = document.getElementById("fileInput");

  exportButton.addEventListener("click", exportData);
  importButton.addEventListener("click", () => fileInput.click());
  resetButton.addEventListener('click', resetData);
  fileInput.addEventListener("change", importData);
}

function exportData() {
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    const problems = data.leetCodeProblems || {};
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
          chrome.storage.sync.set(
            { leetCodeProblems: data.leetCodeProblems },
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
  if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
    chrome.storage.sync.set({ leetCodeProblems: {} }, () => {
      alert('All data has been reset.');
      loadProblems();
    });
  }
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
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    const problems = data.leetCodeProblems || {};
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
