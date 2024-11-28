export { GitAnalyzer } from "./GitAnalyzer";
export { GitScanner } from "./GitScanner";
export * from "./types";

// Example usage as a library:
/*
import { GitAnalyzer, GitScanner } from 'git-statistic-analyzer';

async function analyzeRepositories() {
  // Load ignore patterns
  const ignorePatterns = await GitScanner.loadIgnorePatterns('.scanignore');
  
  // Find repositories
  const scanner = new GitScanner(ignorePatterns);
  const repoPaths = await scanner.findGitRepos();
  
  // Analyze each repository
  const analyzer = new GitAnalyzer(process.cwd());
  const results = [];
  
  for (const repoPath of repoPaths) {
    const stats = await analyzer.analyzeRepository(repoPath);
    if (stats) {
      results.push(stats);
    }
  }
  
  return results;
}
*/
