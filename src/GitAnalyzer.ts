import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import moment from "moment";
import { GitRepositoryStats, GitCommand } from "./types";

const execAsync = promisify(exec);

export class GitAnalyzer {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  private async executeGitCommand({
    command,
    args,
    cwd,
  }: GitCommand): Promise<string> {
    try {
      const { stdout } = await execAsync(`${command} ${args.join(" ")}`, {
        cwd,
      });
      return stdout.trim();
    } catch (error) {
      return "";
    }
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
      const match = dateStr.match(
        /(\w+)\s(\w+)\s(\d+)\s(\d+):(\d+):(\d+)\s(\d+)\s([+-]\d+)/,
      );
      if (!match) return dateStr;

      const [
        _,
        dayName,
        monthName,
        day,
        hours,
        minutes,
        seconds,
        year,
        timezone,
      ] = match;
      const formattedDate = `${year}-${moment().month(monthName).format("MM")}-${day.padStart(2, "0")}`;
      return formattedDate;
    } catch {
      return dateStr;
    }
  }

  private calculateRepoAge(firstDate: string, lastDate: string): string {
    try {
      const first = moment(firstDate, "YYYY-MM-DD");
      const last = moment(lastDate, "YYYY-MM-DD");
      if (!first.isValid() || !last.isValid()) return "0";
      return last.diff(first, "days").toString();
    } catch {
      return "0";
    }
  }

  private async getLastCommitDate(repoPath: string): Promise<string> {
    const date = await this.executeGitCommand({
      command: "git",
      args: ["log", "-1", "--format=%cd"],
      cwd: repoPath,
    });
    return this.formatDate(date);
  }

  private async getLastCommitHash(repoPath: string): Promise<string> {
    return this.executeGitCommand({
      command: "git",
      args: ["rev-parse", "HEAD"],
      cwd: repoPath,
    });
  }

  private async getLastCommitMessage(repoPath: string): Promise<string> {
    return this.executeGitCommand({
      command: "git",
      args: ["log", "-1", "--format=%s"],
      cwd: repoPath,
    });
  }

  private async getTotalCommits(repoPath: string): Promise<string> {
    return this.executeGitCommand({
      command: "git",
      args: ["rev-list", "--count", "HEAD"],
      cwd: repoPath,
    });
  }

  private cleanRepoUrl(url: string): string {
    const sshMatch = url.match(/git@github\.com:([^/]+\/[^.]+)\.git/);
    if (sshMatch) return `github.com/${sshMatch[1]}.git`;

    const httpsMatch = url.match(
      /https:\/\/[^@]+@github\.com\/([^/]+\/[^.]+)\.git/,
    );
    if (httpsMatch) return `github.com/${httpsMatch[1]}.git`;

    const simpleHttpsMatch = url.match(
      /https:\/\/github\.com\/([^/]+\/[^.]+)\.git/,
    );
    if (simpleHttpsMatch) return `github.com/${simpleHttpsMatch[1]}.git`;

    return url;
  }

  private async getRemoteUrls(repoPath: string): Promise<string> {
    const urls = await this.executeGitCommand({
      command: "git",
      args: ["remote", "-v"],
      cwd: repoPath,
    });

    if (!urls) return "";

    const fetchUrl = urls.split("\n").find((line) => line.includes("(fetch)"));
    if (!fetchUrl) return "";

    const urlPart = fetchUrl.split(/\s+/)[1];
    return this.cleanRepoUrl(urlPart);
  }

  private extractUsername(url: string): string {
    const sshMatch = url.match(/git@github\.com:([^/]+)\//);
    if (sshMatch) return sshMatch[1];

    const httpsMatch = url.match(/github\.com\/([^/]+)\//);
    if (httpsMatch) return httpsMatch[1];

    return "";
  }

  private async getFirstCommitDate(repoPath: string): Promise<string> {
    const date = await this.executeGitCommand({
      command: "git",
      args: ["log", "--reverse", "--format=%cd", "|", "head", "-1"],
      cwd: repoPath,
    });
    return this.formatDate(date);
  }

  private async getUncommittedFilesCount(repoPath: string): Promise<string> {
    const modified = await this.executeGitCommand({
      command: "git",
      args: ["status", "--porcelain"],
      cwd: repoPath,
    });
    return modified.split("\n").filter(Boolean).length.toString();
  }

  private async getGitFolderSize(repoPath: string): Promise<string> {
    const gitPath = path.join(repoPath, ".git");
    if (!fs.existsSync(gitPath)) return "0";

    let totalSize = 0;
    const getAllFiles = (dirPath: string): void => {
      const files = fs.readdirSync(dirPath);
      files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          getAllFiles(filePath);
        } else {
          totalSize += stats.size;
        }
      });
    };

    getAllFiles(gitPath);
    return (Math.round((totalSize / (1024 * 1024)) * 10) / 10).toString();
  }

  public async analyzeRepository(
    repoPath: string,
  ): Promise<GitRepositoryStats | null> {
    const gitPath = path.join(repoPath, ".git");
    if (!fs.existsSync(gitPath)) return null;

    const urls = await this.executeGitCommand({
      command: "git",
      args: ["remote", "-v"],
      cwd: repoPath,
    });

    const cleanUrl = await this.getRemoteUrls(repoPath);
    const lastCommitDate = await this.getLastCommitDate(repoPath);
    const firstCommitDate = await this.getFirstCommitDate(repoPath);

    return {
      nameFolder: path.basename(repoPath),
      usernamesUrlRepos: this.extractUsername(urls),
      gitFolderSize: await this.getGitFolderSize(repoPath),
      dateLastCommit: lastCommitDate,
      messageLastCommit: await this.getLastCommitMessage(repoPath),
      amountTotalCommits: await this.getTotalCommits(repoPath),
      ageRepo: this.calculateRepoAge(firstCommitDate, lastCommitDate),
      dateFirstCommit: firstCommitDate,
      urlsRepo: cleanUrl,
      amountUncommitedFiles: await this.getUncommittedFilesCount(repoPath),
      hashLastCommit: await this.getLastCommitHash(repoPath),
      pathFolder: repoPath,
    };
  }
}
