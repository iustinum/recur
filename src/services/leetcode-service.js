import { ProblemManager } from "../lib/problem-manager.js";

export class LeetCodeService {
  constructor() {
    this.problemManager = new ProblemManager();
  }

  async getNextReviewProblem() {
    return this.problemManager.getNextReviewProblem();
  }

  async reviewProblem(titleSlug) {
    return this.problemManager.updateProblemReview(titleSlug);
  }

  async getAllProblems() {
    return this.problemManager.getAllProblems();
  }

  async saveProblem(problem) {
    return this.problemManager.saveProblem(problem);
  }
  async resetAllProblems() {
    return this.problemManager.setAllProblems({});
  }
}
