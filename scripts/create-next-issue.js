import { createMissionIssue, findMissionIssue, getRepositoryFromEnv, getTokenFromEnv, GitHubApi, listAllIssues, reopenIssue } from "./github-api.js";
import { getMissionById } from "./practice-missions.js";

async function main() {
  const nextMissionId = Number(process.env.NEXT_MISSION_ID || process.argv[2] || "1");
  const mission = getMissionById(nextMissionId);

  if (!mission) {
    throw new Error(`No existe la mision ${nextMissionId}.`);
  }

  const { owner, repo } = getRepositoryFromEnv();
  const api = new GitHubApi({ owner, repo, token: getTokenFromEnv() });
  const issues = await listAllIssues(api);
  const duplicate = findMissionIssue(issues, mission);

  if (duplicate) {
    if (duplicate.state === "closed") {
      await reopenIssue(api, duplicate.number);
      console.log(`La mision ${mission.id} ya existia cerrada y fue reabierta como issue #${duplicate.number}.`);
      return;
    }

    console.log(`La mision ${mission.id} ya existe como issue #${duplicate.number}.`);
    return;
  }

  const issue = await createMissionIssue(api, mission);
  console.log(`Mision ${mission.id} creada como issue #${issue.number}: ${issue.html_url}`);
}

main().catch((error) => {
  console.error("No se pudo crear la siguiente mision.");
  console.error(error.message);
  process.exit(1);
});

