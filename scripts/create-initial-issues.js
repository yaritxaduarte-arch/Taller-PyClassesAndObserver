import { createMissionIssue, findMissionIssue, getRepositoryFromEnv, getTokenFromEnv, GitHubApi, listAllIssues, reopenIssue } from "./github-api.js";
import { getMissionById } from "./practice-missions.js";

async function main() {
  const firstMissionId = Number(process.env.FIRST_MISSION_ID || "1");
  const initialMissionCount = Number(process.env.INITIAL_MISSION_COUNT || "1");
  const missionsToCreate = [];

  for (let offset = 0; offset < initialMissionCount; offset += 1) {
    const mission = getMissionById(firstMissionId + offset);
    if (mission) {
      missionsToCreate.push(mission);
    }
  }

  if (missionsToCreate.length === 0) {
    throw new Error("No hay misiones iniciales para crear.");
  }

  const { owner, repo } = getRepositoryFromEnv();
  const api = new GitHubApi({ owner, repo, token: getTokenFromEnv() });
  const existingIssues = await listAllIssues(api);

  for (const mission of missionsToCreate) {
    const duplicate = findMissionIssue(existingIssues, mission);
    if (duplicate) {
      if (duplicate.state === "closed") {
        const reopened = await reopenIssue(api, duplicate.number);
        Object.assign(duplicate, reopened);
        console.log(`La mision ${mission.id} ya existia cerrada y fue reabierta como issue #${duplicate.number}.`);
        continue;
      }

      console.log(`La mision ${mission.id} ya existe abierta como issue #${duplicate.number}. No se duplica.`);
      continue;
    }

    const issue = await createMissionIssue(api, mission);
    existingIssues.push(issue);
    console.log(`Mision ${mission.id} creada como issue #${issue.number}: ${issue.html_url}`);
  }

  const refreshedIssues = await listAllIssues(api);
  const missingOpenMissions = missionsToCreate.filter((mission) => {
    const issue = findMissionIssue(refreshedIssues, mission);
    return !issue || issue.state !== "open";
  });

  if (missingOpenMissions.length > 0) {
    const ids = missingOpenMissions.map((mission) => mission.id).join(", ");
    throw new Error(`No se verifico un issue abierto para las misiones iniciales: ${ids}. No se debe borrar el workflow de inicio.`);
  }

  console.log("Misiones iniciales verificadas como issues abiertos.");
}

main().catch((error) => {
  console.error("No se pudieron crear los issues iniciales.");
  console.error(error.message);
  process.exit(1);
});
