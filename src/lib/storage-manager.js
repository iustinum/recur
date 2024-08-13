export class StorageManager {
  constructor() {
    this.storageKey = "leetCodeProblems";
  }

  async getAllProblems() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(this.storageKey, (data) => {
        if (chrome.runtime.lastError) {
          console.error(
            "StorageManager: Error getting all problems:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else {
          console.log(
            "StorageManager: Got all problems:",
            data[this.storageKey]
          );
          resolve(data[this.storageKey] || {});
        }
      });
    });
  }

  async getProblem(titleSlug) {
    const problems = await this.getAllProblems();
    return problems[titleSlug];
  }

  async saveProblem(problem) {
    console.log("StorageManager: Saving problem:", problem);
    const problems = await this.getAllProblems();
    problems[problem.titleSlug] = problem;
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [this.storageKey]: problems }, () => {
        if (chrome.runtime.lastError) {
          console.error(
            "StorageManager: Error saving problem:",
            chrome.runtime.lastError
          );
          reject(chrome.runtime.lastError);
        } else {
          console.log("StorageManager: Problem saved successfully");
          resolve(problem);
        }
      });
    });
  }

  async setAllProblems(problems) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [this.storageKey]: problems }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}
