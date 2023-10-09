import React, { useEffect, useState } from "react";
import axios from "axios";

const GitHubRepositoryInfo = () => {
  const [repositoryInfo, setRepositoryInfo] = useState(null);
  const [commitsInfo, setCommitsInfo] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [contributorCommits, setContributorCommits] = useState({});
  const [contributorPRs, setContributorPRs] = useState({});

  useEffect(() => {
    const fetchRepositoryInfo = async () => {
      try {
        const owner = "HariomGupta123"; // Replace with the desired repository owner
        const repo = "hactoberfest2023"; // Replace with the desired repository name
        const token = "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"; // Replace with your GitHub Personal Access Token

        const repositoryResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        setRepositoryInfo(repositoryResponse.data);

        const commitsResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/commits`
        );
        setCommitsInfo(commitsResponse.data);

        const contributorsResponse = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/contributors`
        );
        setContributors(contributorsResponse.data);

        // Calculate and set the number of commits for each contributor
        const commitsByContributor = {};
        commitsResponse.data.forEach((commit) => {
          const contributorLogin = commit.author
            ? commit.author.login
            : "Unknown";
          commitsByContributor[contributorLogin] =
            commitsByContributor[contributorLogin] + 1 || 1;
        });
        setContributorCommits(commitsByContributor);

        // Fetch and set the number of PRs for each contributor
        const prsByContributor = {};
        await Promise.all(
          contributors.map(async (contributor) => {
            try {
              const prResponse = await axios.get(
                `https://api.github.com/search/issues?q=is:pr+author:${contributor.login}+repo:${owner}/${repo}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              prsByContributor[contributor.login] = prResponse.data.total_count;
            } catch (error) {
              console.error(
                "Error fetching PRs for contributor:",
                contributor.login,
                error
              );
            }
          })
        );
        setContributorPRs(prsByContributor);
      } catch (error) {
        console.error("Error fetching GitHub data:", error);
      }
    };

    fetchRepositoryInfo();
  }, []);

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  // Create an array of contributors sorted by commit count
  const sortedContributors = Object.keys(contributorCommits).sort(
    (a, b) => contributorCommits[b] - contributorCommits[a]
  );

  return (
    <div>
      <h1>GitHub Repository Information</h1>

      {repositoryInfo && (
        <div>
          <h2>Repository Name: {repositoryInfo.full_name}</h2>
          <p>Description: {repositoryInfo.description}</p>
          {/* Add more repository information as needed */}
        </div>
      )}

      <h2>Leaderboard (Based on Commits):</h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {sortedContributors.map((contributor) => (
          <div
            key={contributor}
            style={{
              padding: "10px",
              margin: "10px",
              borderRadius: "5px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <img
                src={
                  contributors.find((c) => c.login === contributor)
                    ?.avatar_url || ""
                }
                alt="Contributor Avatar"
                style={{ width: "50px", borderRadius: "50%" }}
              />
            </div>
            <div style={{ flex: 2 }}>
              <p>Login: {contributor}</p>
              <p>
                Contributions:{" "}
                {contributors.find((c) => c.login === contributor)
                  ?.contributions || 0}
              </p>
              <p>Commits: {contributorCommits[contributor] || 0}</p>
              <p>PRs: {contributorPRs[contributor] || 0}</p>
            </div>
            {/* Add more contributor information as needed */}
          </div>
        ))}
      </div>

      <h2>Latest Commits:</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: "20px",
          padding: "20px",
        }}
      >
        {commitsInfo.map((commit) => (
          <div
            key={commit.sha}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          >
            <h3>{commit.commit.message}</h3>
            <p>SHA: {commit.sha}</p>
            <p>Author: {commit.commit.author.name}</p>
            <p>Date: {formatDate(commit.commit.author.date)}</p>
            {/* Add more commit information as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubRepositoryInfo;
