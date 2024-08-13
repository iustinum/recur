import { LeetCodeService } from "../services/leetcode-service.js";

const leetCodeService = new LeetCodeService();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getNextReviewProblem":
      leetCodeService.getNextReviewProblem().then(sendResponse);
      break;
    case "reviewProblem":
      leetCodeService.reviewProblem(request.titleSlug).then(sendResponse);
      break;
    case "getAllProblems":
      leetCodeService.getAllProblems().then(sendResponse);
      break;
    case "saveProblem":
      console.log("Background: Saving problem:", request.problem);
      leetCodeService
        .saveProblem(request.problem)
        .then((result) => {
          console.log("Background: Problem saved result:", result);
          sendResponse({
            success: true,
            message: "Problem saved successfully",
            result,
          });
        })
        .catch((error) => {
          console.error("Background: Error saving problem:", error);
          sendResponse({
            success: false,
            message: "Error saving problem",
            error: error.toString(),
          });
        });
      break;
    case "resetAllProblems":
      console.log("Resetting all problems");
      leetCodeService
        .resetAllProblems()
        .then(() => {
          console.log("All problems reset successfully");
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("Error resetting problems:", error);
          sendResponse({ success: false });
        });
      break;
  }
  return true; // Indicates that we will send a response asynchronously
});
