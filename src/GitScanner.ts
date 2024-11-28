import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import { homedir } from "os";

export class GitScanner {
  private ignorePatterns: string[];
  private homeDir: string;

  constructor(ignorePatterns: string[]) {
    this.ignorePatterns = ignorePatterns;
    this.homeDir = homedir();
  }

  private shouldIgnore(filePath: string): boolean {
    const relativePath = path.relative(this.homeDir, filePath);
    return this.ignorePatterns.some((pattern) => {
      const regexPattern = pattern
        .replace(/\./g, "\\.")
        .replace(/\*/g, ".*")
        .replace(/\?/g, ".");
      return new RegExp(regexPattern).test(relativePath);
    });
  }

  private isValidGitDir(gitPath: string): boolean {
    try {
      return (
        fs.statSync(gitPath).isDirectory() &&
        fs.existsSync(path.join(gitPath, "HEAD")) &&
        fs.existsSync(path.join(gitPath, "config"))
      );
    } catch {
      return false;
    }
  }

  public async findGitRepos(): Promise<string[]> {
    try {
      const gitFolders = await glob("**/.git", {
        cwd: this.homeDir,
        ignore: ["**/node_modules/**"],
        absolute: true,
        dot: true,
      });

      return gitFolders
        .filter((gitFolder) => this.isValidGitDir(gitFolder))
        .map((gitFolder) => path.dirname(gitFolder))
        .filter((repoPath) => !this.shouldIgnore(repoPath));
    } catch (error) {
      console.error("Error scanning repositories:", error);
      return [];
    }
  }

  public static async loadIgnorePatterns(
    configPath: string,
  ): Promise<string[]> {
    const defaultPatterns = [
      "**/node_modules/**",
      "**/vendor/**",
      "**/dist/**",
      "**/auto_gpt_workspace/**", // Add problematic paths
      "**/broken_repos/**",
    ];

    try {
      if (!fs.existsSync(configPath)) {
        return defaultPatterns;
      }

      const content = await fs.promises.readFile(configPath, "utf-8");
      const patterns = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

      return patterns.length ? patterns : defaultPatterns;
    } catch (error) {
      console.warn(
        `Warning: Could not load ignore patterns from ${configPath}`,
      );
      return defaultPatterns;
    }
  }
}
