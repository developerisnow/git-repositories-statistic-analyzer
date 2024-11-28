#!/usr/bin/env node

import { program } from "commander";
import * as path from "path";
import * as fs from "fs";
import { stringify } from "csv-stringify/sync";
import { GitAnalyzer } from "./GitAnalyzer";
import { GitScanner } from "./GitScanner";
import { GitRepositoryStats } from "./types";

const PROGRAM_NAME = "git-repositories-statistic-analyzer";
const VERSION = "1.0.0";
const DESCRIPTION = "Analyze Git repositories and generate statistics";

const CSV_HEADERS = [
  "nameFolder",
  "usernamesUrlRepos",
  "gitFolderSize",
  "dateLastCommit",
  "messageLastCommit",
  "amountTotalCommits",
  "ageRepo",
  "dateFirstCommit",
  "urlsRepo",
  "amountUncommitedFiles",
  "hashLastCommit",
  "pathFolder",
];

async function processRepositories(
  folderPath: string,
  repoList: string,
  filter?: string,
): Promise<void> {
  try {
    const configDir = path.dirname(process.argv[1]);
    const ignorePatterns = await GitScanner.loadIgnorePatterns(
      path.join(configDir, ".scanignore"),
    );

    let repoPaths: string[] = [];
    const isAllMode =
      folderPath.toLowerCase() === "all" && repoList.toLowerCase() === "all";

    if (isAllMode) {
      console.log("Scanning system for Git repositories...");
      const scanner = new GitScanner(ignorePatterns);
      repoPaths = await scanner.findGitRepos();
      console.log(`Found ${repoPaths.length} repositories`);
    } else {
      const repoNames = fs
        .readFileSync(repoList, "utf-8")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      repoPaths = repoNames.map((name) => path.join(folderPath, name));
    }

    const analyzer = new GitAnalyzer(
      isAllMode ? process.env.HOME || "" : folderPath,
    );
    const results: GitRepositoryStats[] = [];

    for (const repoPath of repoPaths) {
      console.log(`Analyzing repository: ${path.basename(repoPath)}`);
      const result = await analyzer.analyzeRepository(repoPath);

      if (result) {
        if (filter) {
          const [field, value] = filter.split(":");
          if (field === "UsernamesUrlRepos") {
            if (value.toLowerCase() === "empty") {
              if (!result.urlsRepo) results.push(result);
            } else {
              const usernames = value.split(",");
              if (usernames.includes(result.usernamesUrlRepos)) {
                results.push(result);
              }
            }
          }
        } else {
          results.push(result);
        }
      } else {
        console.log(`Skipping ${repoPath}: Not a valid Git repository`);
      }
    }

    const csvContent = stringify([
      CSV_HEADERS,
      ...results.map((r) =>
        CSV_HEADERS.map((h) => r[h as keyof GitRepositoryStats]),
      ),
    ]);
    fs.writeFileSync("git_statistic.csv", csvContent);
    console.log("Results written to git_statistic.csv");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

program
  .name(PROGRAM_NAME)
  .description(DESCRIPTION)
  .version(VERSION)
  .requiredOption(
    "--folderPath <path>",
    'Base path containing Git repositories or "all" for system scan',
  )
  .requiredOption(
    "--repoList <path>",
    'Path to repository list file or "all" for automatic discovery',
  )
  .option(
    "--filter <criteria>",
    'Filter results (e.g., "UsernamesUrlRepos:user1,user2" or "UsernamesUrlRepos:Empty")',
  )
  .action((options) => {
    processRepositories(options.folderPath, options.repoList, options.filter);
  });

program.parse();
