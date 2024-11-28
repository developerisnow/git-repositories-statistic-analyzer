export interface GitRepositoryStats {
  nameFolder: string;
  usernamesUrlRepos: string;
  gitFolderSize: string;
  dateLastCommit: string;
  messageLastCommit: string;
  amountTotalCommits: string;
  ageRepo: string;
  dateFirstCommit: string;
  urlsRepo: string;
  amountUncommitedFiles: string;
  hashLastCommit: string;
  pathFolder: string;
}

export interface ScanOptions {
  folderPath: string;
  repoList: string;
  filter?: string;
}

export interface FilterCriteria {
  usernameFilter: Set<string>;
  showEmptyUrls: boolean;
}

export interface GitCommand {
  command: string;
  args: string[];
  cwd: string;
}
