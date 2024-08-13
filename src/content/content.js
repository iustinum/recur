import { findSubmissionId, checkSubmissionStatus } from "./submission-utils.js";

function captureSubmission() {
  const titleElement = document.querySelector('[data-cy="question-title"]');
  const difficultyElement = document.querySelector("[diff]");

  if (titleElement && difficultyElement) {
    const title = titleElement.textContent;
    const titleSlug = window.location.pathname.split("/")[2];
    const difficulty = difficultyElement.textContent;

    setTimeout(() => {
      const submissionId = findSubmissionId();
      if (submissionId) {
        checkSubmissionStatus(submissionId, title, titleSlug, difficulty);
      }
    }, 2000);
  }
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "childList") {
      const submitButton = document.querySelector(
        '[data-cy="submit-code-btn"]'
      );
      if (submitButton) {
        submitButton.addEventListener("click", captureSubmission);
        observer.disconnect();
      }
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
