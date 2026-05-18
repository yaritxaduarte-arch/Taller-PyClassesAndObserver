import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import {
  closeIssue,
  createMissionIssue,
  findMissionIssue,
  getRepositoryFromEnv,
  getTokenFromEnv,
  GitHubApi,
  listAllIssues,
  reopenIssue,
  upsertIssueComment
} from "./github-api.js";
import { extractMissionId, getMissionById, getNextMission } from "./practice-missions.js";
import { calculateScore, formatScoreMarkdown, getPracticeChecks } from "./validate-python-practice.js";

function git(args, options = {}) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    if (options.allowFailure) {
      return "";
    }

    throw new Error(`No se pudo ejecutar git ${args.join(" ")}: ${error.stderr?.toString() || error.message}`);
  }
}

function readEventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !existsSync(eventPath)) {
    return null;
  }

  return JSON.parse(readFileSync(eventPath, "utf8"));
}

function eventName() {
  return process.env.GITHUB_EVENT_NAME || "manual";
}

function currentRefName(payload) {
  return process.env.GITHUB_REF_NAME
    || payload?.ref
    || payload?.pull_request?.head?.ref
    || "";
}

function changedFilesFromPayload(payload) {
  const files = new Set();

  for (const commit of payload?.commits || []) {
    for (const file of [...(commit.added || []), ...(commit.modified || []), ...(commit.removed || [])]) {
      files.add(file);
    }
  }

  return files;
}

function hasCommitForFileSinceIssue(issue, filePath) {
  if (!issue?.created_at) {
    return false;
  }

  const commits = git(["log", `--since=${issue.created_at}`, "--format=%H", "--", filePath], { allowFailure: true });
  return commits.length > 0;
}

function fileWasTouched(issue, payload, filePath) {
  return changedFilesFromPayload(payload).has(filePath) || hasCommitForFileSinceIssue(issue, filePath);
}

function check(ok, text, fix = "") {
  return { ok, text, fix };
}

function result({ mission, passed, checks, score = null }) {
  return { mission, passed, checks, score };
}

async function evaluateMission(mission, issue, context) {
  const payload = context.payload;
  const practice = getPracticeChecks({ runPytest: mission.id >= 8 || mission.id === 10 });

  switch (mission.id) {
    case 1: {
      const checks = [
        check(fileWasTouched(issue, payload, "README.md"), "README.md fue modificado despues de abrir esta mision", "Edita README.md y publica un commit con los pasos de venv."),
        ...practice.venv.details
      ];

      return result({ mission, passed: checks.every((item) => item.ok), checks });
    }

    case 2:
      return result({
        mission,
        passed: practice.packageStructure.ok,
        checks: practice.packageStructure.details
      });

    case 3:
      return result({
        mission,
        passed: practice.suscriptorEmail.ok,
        checks: practice.suscriptorEmail.details
      });

    case 4:
      return result({
        mission,
        passed: practice.observerContract.ok,
        checks: practice.observerContract.details
      });

    case 5:
      return result({
        mission,
        passed: practice.canal.ok,
        checks: practice.canal.details
      });

    case 6: {
      const observerChecks = practice.observerBehavior.details.filter((item) => !/pytest/i.test(item.text));
      return result({
        mission,
        passed: observerChecks.every((item) => item.ok),
        checks: observerChecks
      });
    }

    case 7:
      return result({
        mission,
        passed: practice.demo.ok,
        checks: practice.demo.details
      });

    case 8: {
      const pytestCheck = practice.observerBehavior.details.find((item) => /pytest/i.test(item.text));
      const checks = pytestCheck ? [pytestCheck] : practice.observerBehavior.details;

      return result({
        mission,
        passed: checks.every((item) => item.ok),
        checks
      });
    }

    case 9: {
      const checks = [
        check(fileWasTouched(issue, payload, "README.md"), "README.md fue modificado despues de abrir esta mision", "Publica un commit nuevo con la documentacion final."),
        ...practice.readme.details
      ];

      return result({ mission, passed: checks.every((item) => item.ok), checks });
    }

    case 10: {
      const score = calculateScore({ runPytest: true });
      const checks = score.categories.map((item) => check(
        item.ok,
        `${item.text}: ${item.ok ? item.points : 0}/${item.points}`,
        item.details.find((detail) => !detail.ok)?.fix || "Revisa los detalles de la rubrica."
      ));

      return result({ mission, passed: score.total === 100, checks, score });
    }

    default:
      return result({
        mission,
        passed: false,
        checks: [
          check(false, "No hay una validacion automatica definida para esta mision", "Espera a que el docente ajuste la validacion.")
        ]
      });
  }
}

function feedbackMarker(missionId) {
  return `<!-- python-classes-practice:auto-feedback:mission=${missionId} -->`;
}

function formatChecks(checks) {
  return checks
    .map((item) => `${item.ok ? "- [x]" : "- [ ]"} ${item.text}${item.ok || !item.fix ? "" : `\n  Sugerencia: ${item.fix}`}`)
    .join("\n");
}

function formatFeedback(mission, validation, statusText) {
  const scoreBlock = validation.score
    ? `\n### Calificacion\n${formatScoreMarkdown(validation.score)}\n`
    : "";

  return `## Seguimiento automatico

**Estado:** ${statusText}

**Que estas practicando:** ${mission.summary}

**Por que importa:** ${mission.why}

### Revision
${formatChecks(validation.checks)}
${scoreBlock}
${validation.passed ? "La mision cumple los criterios automaticos. Se cerrara y se preparara la siguiente mision si existe." : "Aun falta ajustar uno o mas puntos. Cuando publiques nuevos cambios, esta revision se actualizara."}`;
}

function annotateWarnings(mission, validation) {
  for (const item of validation.checks.filter((entry) => !entry.ok)) {
    const message = `${item.text}. ${item.fix}`.replace(/\r?\n/g, " ");
    console.log(`::warning title=Mision ${mission.id}::${message}`);
  }
}

function appendStepSummary(mission, validation) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  const lines = [
    `## Mision ${mission.id}: ${mission.title}`,
    "",
    validation.passed ? "Estado: completada automaticamente." : "Estado: requiere ajustes.",
    "",
    formatChecks(validation.checks),
    ""
  ];

  if (validation.score) {
    lines.push(formatScoreMarkdown(validation.score), "");
  }

  try {
    appendFileSync(summaryPath, `${lines.join("\n")}\n`);
  } catch {
    // El resumen no debe romper la validacion.
  }
}

function missionIdFromIssue(issue) {
  return extractMissionId(`${issue.title || ""}\n${issue.body || ""}`);
}

function targetMissionIds(payload, openIssues) {
  if (eventName() === "workflow_dispatch") {
    return openIssues.map(missionIdFromIssue).filter(Boolean);
  }

  if (["push", "pull_request"].includes(eventName())) {
    return openIssues.map(missionIdFromIssue).filter(Boolean);
  }

  if (eventName() === "manual") {
    return openIssues.map(missionIdFromIssue).filter(Boolean);
  }

  return [];
}

async function createNextMissionIfNeeded(api, issues, completedMission) {
  const nextMission = getNextMission(completedMission.id);
  if (!nextMission) {
    return null;
  }

  const duplicate = findMissionIssue(issues, nextMission);
  if (duplicate) {
    if (duplicate.state === "closed") {
      const reopened = await reopenIssue(api, duplicate.number);
      console.log(`La siguiente mision ya existia cerrada. Se reabrio el issue #${duplicate.number}.`);
      return reopened;
    }

    return duplicate;
  }

  const created = await createMissionIssue(api, nextMission);
  issues.push(created);
  return created;
}

async function processMission(context, issue, mission) {
  const validation = await evaluateMission(mission, issue, context);
  const statusText = validation.passed ? "Completada" : "En progreso";

  appendStepSummary(mission, validation);

  await upsertIssueComment(
    context.api,
    issue.number,
    feedbackMarker(mission.id),
    formatFeedback(mission, validation, statusText)
  );

  if (!validation.passed) {
    annotateWarnings(mission, validation);
    return;
  }

  const nextIssue = await createNextMissionIfNeeded(context.api, context.issues, mission);
  await closeIssue(context.api, issue.number);

  if (nextIssue) {
    console.log(`Siguiente issue preparado: #${nextIssue.number}. Mision ${mission.id} cerrada.`);
  } else {
    console.log(`Mision ${mission.id} cerrada. No quedan mas misiones.`);
  }
}

async function main() {
  const payload = readEventPayload();
  if (!payload) {
    console.log("No hay evento de GitHub Actions. No se valida progreso automatico.");
    return;
  }

  const { owner, repo } = getRepositoryFromEnv();
  const api = new GitHubApi({ owner, repo, token: getTokenFromEnv() });
  const issues = await listAllIssues(api);
  const openMissionIssues = issues
    .filter((issue) => issue.state === "open")
    .filter((issue) => missionIdFromIssue(issue))
    .sort((a, b) => missionIdFromIssue(a) - missionIdFromIssue(b));

  const targets = new Set(targetMissionIds(payload, openMissionIssues));
  if (targets.size === 0) {
    console.log(`Evento ${eventName()} recibido en ${currentRefName(payload)}, pero no corresponde a una mision automatica.`);
    return;
  }

  const context = {
    api,
    payload,
    issues
  };

  for (const issue of openMissionIssues) {
    const missionId = missionIdFromIssue(issue);
    if (!targets.has(missionId)) {
      continue;
    }

    const mission = getMissionById(missionId);
    if (!mission) {
      continue;
    }

    await processMission(context, issue, mission);
  }
}

main().catch((error) => {
  console.error("No se pudo validar el progreso de la practica.");
  console.error(error.message);
  process.exit(1);
});
