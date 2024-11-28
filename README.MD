# Git Repositories Statistics Analyzer

[![npm version](https://badge.fury.io/js/%40developerisnow%2Fgit-repositories-statistic-analyzer.svg)](https://www.npmjs.com/package/@developerisnow/git-repositories-statistic-analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A powerful Node.js tool for analyzing multiple Git repositories and generating comprehensive statistics. Perfect for developers and teams who need to track and analyze Git repositories at scale.

## 🚀 Features

- 📊 Analyze multiple Git repositories in bulk
- 🔍 System-wide repository scanning
- 📝 Detailed Git metrics and repository information
- 📈 CSV output with proper formatting
- 🎯 Username and empty repository filtering
- ⚡ Asynchronous processing
- 🛡️ TypeScript support
- 📋 Comprehensive repository statistics

## 📦 Installation

```bash
# Using npm
npm install -g @developerisnow/git-repositories-statistic-analyzer

# Using pnpm (recommended)
pnpm add -g @developerisnow/git-repositories-statistic-analyzer

# Using yarn
yarn global add @developerisnow/git-repositories-statistic-analyzer
```

## 🎮 Command Line Usage

### Basic Usage

```bash
# Analyze specific repositories
git-repositories-statistic-analyzer --folderPath=/path/to/repos --repoList=/path/to/repo_list.txt

# Scan all repositories in the system
git-repositories-statistic-analyzer --folderPath=all --repoList=all

# Filter repositories by username
git-repositories-statistic-analyzer --folderPath=all --repoList=all --filter "UsernamesUrlRepos:username1,username2"

# Find local repositories (no remote URLs)
git-repositories-statistic-analyzer --folderPath=all --repoList=all --filter "UsernamesUrlRepos:Empty"
```

### Options

- `--folderPath`: Base directory containing Git repositories or "all" for system scan
- `--repoList`: Path to repository list file or "all" for automatic discovery
- `--filter`: Filter results (e.g., "UsernamesUrlRepos:user1,user2" or "UsernamesUrlRepos:Empty")

## 💻 Programmatic Usage

```typescript
import { GitAnalyzer, GitScanner } from '@developerisnow/git-repositories-statistic-analyzer';

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
```

## 📊 Output Format

The tool generates a CSV file with the following columns:

| Column | Description |
|--------|-------------|
| nameFolder | Repository folder name |
| usernamesUrlRepos | Usernames from remote URLs |
| gitFolderSize | Size of the .git folder (in MB) |
| dateLastCommit | Date of the most recent commit (YYYY-MM-DD) |
| messageLastCommit | Message of the last commit |
| amountTotalCommits | Total number of commits |
| ageRepo | Repository age in days |
| dateFirstCommit | Date of the first commit (YYYY-MM-DD) |
| urlsRepo | Repository remote URLs (cleaned format) |
| amountUncommitedFiles | Number of uncommitted files |
| hashLastCommit | Hash of the last commit |
| pathFolder | Full path to the repository |

See [git_statistic.example.csv](git_statistic.example.csv) for an example output.

## 🛠️ Configuration

### Repository List Format

Create a text file with one repository folder name per line:
```
repo1_folder
repo2_folder
```

### Ignore Patterns (.scanignore)

Create a `.scanignore` file to specify patterns to ignore:
```
**/node_modules/**
**/vendor/**
**/dist/**
# Add more patterns as needed
```

## 🧪 Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Format code
pnpm format

# Lint code
pnpm lint

# Build the project
pnpm build

# Run in development mode
pnpm dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**developerisnow**

* Github: [@developerisnow](https://github.com/developerisnow)
* npm: [@developerisnow](https://www.npmjs.com/~developerisnow)

## ⭐️ Show your support

Give a ⭐️ if this project helped you!
