import { StorageManager } from "./storage-manager.js";
import { calculateNextReview } from "./spaced-repetition.js";

export class ProblemManager {
  constructor() {
    this.storageManager = new StorageManager();
  }

  async updateProblemReview(titleSlug) {
    const problem = await this.storageManager.getProblem(titleSlug);
    if (!problem) throw new Error("Problem not found");

    problem.lastReviewed = Date.now();
    problem.reviewCount = (problem.reviewCount || 0) + 1;
    problem.nextReview = calculateNextReview(Date.now(), problem.reviewCount);

    await this.storageManager.saveProblem(problem);
    return problem;
  }

  async getNextReviewProblem() {
    const problems = await this.storageManager.getAllProblems();
    const now = Date.now();
    return Object.values(problems).reduce((acc, problem) => {
      if (!acc || problem.nextReview < acc.nextReview) {
        return problem;
      }
      return acc;
    }, null);
  }

  async getAllProblems() {
    return this.storageManager.getAllProblems();
  }

  async saveProblem(problem) {
    console.log("ProblemManager: Saving problem:", problem);
    const existingProblem = await this.storageManager.getProblem(
      problem.titleSlug
    );
    console.log("ProblemManager: Existing problem:", existingProblem);

    if (existingProblem) {
      problem.reviewCount = (existingProblem.reviewCount || 0) + 1;
    } else {
      problem.reviewCount = 1;
    }

    problem.lastReviewed = Date.now();
    problem.nextReview = calculateNextReview(Date.now(), problem.reviewCount);

    console.log("ProblemManager: Updated problem to save:", problem);
    const result = await this.storageManager.saveProblem(problem);
    console.log("ProblemManager: Save result:", result);
    return result;
  }

  async setAllProblems(problems) {
    return this.storageManager.setAllProblems(problems);
  }

  async resetAllProblems() {
    return this.setAllProblems({});
  }
}
