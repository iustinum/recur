function captureSubmission() {
  const titleElement = document.querySelector('[data-cy="question-title"]');
  const difficultyElement = document.querySelector('[diff]');
  
  if (titleElement && difficultyElement) {
    const title = titleElement.textContent;
    const titleSlug = window.location.pathname.split('/')[2];
    const difficulty = difficultyElement.textContent;

    chrome.runtime.sendMessage({
      action: "submitProblem",
      problem: {
        title,
        titleSlug,
        difficulty,
        url: window.location.href
      }
    });
  }
}

// Watch for the submission button click
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      const submitButton = document.querySelector('[data-cy="submit-code-btn"]');
      if (submitButton) {
        submitButton.addEventListener('click', captureSubmission);
        observer.disconnect();
      }
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });