chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    if (!data.leetCodeProblems) {
      chrome.storage.sync.set({ leetCodeProblems: {} });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "submitProblem") {
    saveProblem(request.problem, sendResponse);
  } else if (request.action === "getNextReview") {
    getNextReviewProblem(sendResponse);
  } else if (request.action === "updateProblemReview") {
    updateProblemReview(request.titleSlug, sendResponse);
  }
  return true; // Keep the message channel open for the async response
});

function saveProblem(problem, callback) {
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    const problems = data.leetCodeProblems || {};
    problems[problem.titleSlug] = {
      title: problem.title,
      titleSlug: problem.titleSlug,
      difficulty: problem.difficulty,
      url: problem.url,
      lastReviewed: Date.now(),
      nextReview: calculateNextReview(
        Date.now(),
        (problems[problem.titleSlug]?.reviewCount || 0) + 1
      ),
      reviewCount: (problems[problem.titleSlug]?.reviewCount || 0) + 1,
    };
    chrome.storage.sync.set({ leetCodeProblems: problems }, callback);
  });
}

function updateProblemReview(titleSlug, callback) {
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    const problems = data.leetCodeProblems || {};
    if (problems[titleSlug]) {
      problems[titleSlug] = {
        ...problems[titleSlug],
        lastReviewed: Date.now(),
        nextReview: calculateNextReview(
          Date.now(),
          (problems[titleSlug].reviewCount || 0) + 1
        ),
        reviewCount: (problems[titleSlug].reviewCount || 0) + 1,
      };
      chrome.storage.sync.set({ leetCodeProblems: problems }, callback);
    } else {
      callback();
    }
  });
}

function getNextReviewProblem(sendResponse) {
  chrome.storage.sync.get("leetCodeProblems", (data) => {
    const problems = data.leetCodeProblems || {};
    const now = Date.now();
    const nextProblem = Object.values(problems).reduce((acc, problem) => {
      if (!acc || problem.nextReview < acc.nextReview) {
        return problem;
      }
      return acc;
    }, null);
    sendResponse(nextProblem);
  });
}

function calculateNextReview(lastReview, reviewCount) {
  const intervalInDays = Math.pow(2, reviewCount);
  return lastReview + intervalInDays * 24 * 60 * 60 * 1000;
}
