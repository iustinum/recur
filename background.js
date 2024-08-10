chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ problems: {} });
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

function saveProblem(problem) {
  chrome.storage.local.get("problems", (data) => {
    const problems = data.problems || {};
    const existingProblem = problems[problem.titleSlug] || {};
    problems[problem.titleSlug] = {
      ...existingProblem,
      ...problem,
      lastReviewed: Date.now(),
      nextReview: calculateNextReview(
        Date.now(),
        existingProblem.reviewCount || 0
      ),
      reviewCount: (existingProblem.reviewCount || 0) + 1,
    };
    chrome.storage.local.set({ problems });
  });
}

function updateProblemReview(titleSlug, callback) {
  chrome.storage.local.get("problems", (data) => {
    const problems = data.problems || {};
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
      chrome.storage.local.set({ problems }, callback);
    } else {
      callback();
    }
  });
}

function getNextReviewProblem(sendResponse) {
  chrome.storage.local.get("problems", (data) => {
    const problems = data.problems || {};
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
