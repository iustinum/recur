export function findSubmissionId() {
  const e = document.getElementsByClassName("status-column__3SUg");
  if (e && e.length > 1) {
    const submissionRef = e[1].innerHTML.split(" ")[1];
    const match = submissionRef.match(/submissions\/detail\/(\d+)/);
    return match ? match[1] : null;
  }
  const submissionRef = document.getElementById("result-state");
  return submissionRef ? submissionRef.href.split("/").pop() : null;
}

export function checkSubmissionStatus(
  submissionId,
  title,
  titleSlug,
  difficulty
) {
  console.log(`Checking submission status for ID: ${submissionId}`);
  fetch(`https://leetcode.com/submissions/detail/${submissionId}/check/`, {
    method: "GET",
    headers: {
      "x-requested-with": "XMLHttpRequest",
      Accept: "application/json",
    },
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Submission status data:", data);
      if (data.state === "SUCCESS" && data.status_msg === "Accepted") {
        const problem = {
          title,
          titleSlug,
          difficulty,
          url: window.location.href,
          stats: `Time: ${data.status_runtime}, Memory: ${data.status_memory}`,
          lastReviewed: Date.now(),
          nextReview: Date.now() + 24 * 60 * 60 * 1000, // Set next review to 1 day from now
          reviewCount: 1,
        };
        console.log("Sending problem to be saved:", problem);
        chrome.runtime.sendMessage(
          { action: "saveProblem", problem },
          (response) => {
            console.log("Save problem response:", response);
            if (chrome.runtime.lastError) {
              console.error("Error saving problem:", chrome.runtime.lastError);
            }
          }
        );
      } else {
        console.log("Submission not accepted or unexpected state");
      }
    })
    .catch((error) => {
      console.error("Error checking submission status:", error);
    });
}
