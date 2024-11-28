import { GitAnalyzer } from "../GitAnalyzer";
import * as path from "path";

describe("GitAnalyzer", () => {
  let analyzer: GitAnalyzer;

  beforeEach(() => {
    analyzer = new GitAnalyzer(process.cwd());
  });

  it("should create an instance", () => {
    expect(analyzer).toBeInstanceOf(GitAnalyzer);
  });

  it("should handle invalid repository path", async () => {
    const result = await analyzer.analyzeRepository(
      path.join(process.cwd(), "non-existent-repo"),
    );
    expect(result).toBeNull();
  });
});
