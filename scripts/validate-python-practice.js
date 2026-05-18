import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REQUIRED_README_SECTIONS = [
  { level: 1, text: "Instrucciones para estudiantes" },
  { level: 2, text: "Objetivo de la practica" },
  { level: 2, text: "Crear el entorno virtual" },
  { level: 2, text: "Estructura esperada" },
  { level: 2, text: "Crear clases en Python" },
  { level: 2, text: "Implementar Observer paso a paso" },
  { level: 2, text: "Ejecutar la demo" },
  { level: 2, text: "Ejecutar pruebas" },
  { level: 2, text: "Ver la calificacion" },
  { level: 2, text: "Autores" }
];

function readText(filePath) {
  if (!existsSync(filePath)) {
    return "";
  }

  return readFileSync(filePath, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function stripFencedCodeBlocks(markdown) {
  let insideFence = false;

  return markdown
    .split(/\r?\n/)
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        insideFence = !insideFence;
        return "";
      }

      return insideFence ? "" : line;
    })
    .join("\n");
}

function hasHeading(markdown, section) {
  const hashes = "#".repeat(section.level);

  return markdown.split(/\r?\n/).some((line) => {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    return match
      && match[1] === hashes
      && normalizeText(match[2]) === normalizeText(section.text);
  });
}

function sectionContent(markdown, headingText) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => {
    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    return match
      && match[1] === "##"
      && normalizeText(match[2]) === normalizeText(headingText);
  });

  if (start === -1) {
    return "";
  }

  const collected = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^#{1,2}\s+/.test(lines[index])) {
      break;
    }
    collected.push(lines[index]);
  }

  return collected.join("\n").trim();
}

function check(ok, text, fix = "") {
  return { ok, text, fix };
}

function truncate(value, limit = 700) {
  const text = String(value || "").trim();
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit)}...`;
}

function pythonEnv() {
  const srcPath = path.resolve("src");
  const pythonPath = [srcPath, process.env.PYTHONPATH].filter(Boolean).join(path.delimiter);

  return {
    ...process.env,
    PYTHONPATH: pythonPath
  };
}

function runPythonCheck(code) {
  try {
    execFileSync("python3", ["-c", code], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: pythonEnv()
    });

    return { ok: true, error: "" };
  } catch (error) {
    const details = error.stderr?.toString() || error.stdout?.toString() || error.message;
    return { ok: false, error: truncate(details) };
  }
}

function runCommand(command, args) {
  try {
    const output = execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: pythonEnv()
    });

    return { ok: true, output: truncate(output) };
  } catch (error) {
    const details = error.stderr?.toString() || error.stdout?.toString() || error.message;
    return { ok: false, output: truncate(details) };
  }
}

export function validateReadmeStructure(markdown = readText("README.md")) {
  const cleanMarkdown = stripFencedCodeBlocks(markdown);

  return REQUIRED_README_SECTIONS.map((section) => {
    const marker = `${"#".repeat(section.level)} ${section.text}`;
    return check(
      hasHeading(cleanMarkdown, section),
      `${marker} existe`,
      `Agrega el encabezado exacto \`${marker}\`.`
    );
  });
}

function venvDetails() {
  const readme = readText("README.md");
  const gitignore = readText(".gitignore");
  const requirements = readText("requirements.txt");
  const installation = sectionContent(readme, "Crear el entorno virtual") || sectionContent(readme, "Instalacion");
  const venvCommand = /python(3)?\s+-m\s+venv\s+\.venv/i.test(installation);
  const activation = /source\s+\.venv\/bin\/activate|\.venv\\Scripts\\activate/i.test(installation);
  const pipInstall = /pip\s+install\s+-r\s+requirements\.txt/i.test(installation);

  return [
    check(venvCommand, "README documenta como crear .venv", "Agrega `python3 -m venv .venv` en Instalacion."),
    check(activation, "README documenta como activar el entorno", "Agrega `source .venv/bin/activate` o `.venv\\Scripts\\activate`."),
    check(pipInstall, "README documenta instalacion con requirements.txt", "Agrega `pip install -r requirements.txt`."),
    check(!/completa esta seccion|pistas esperadas/i.test(installation), "Instalacion fue personalizada", "Reemplaza las pistas iniciales por tus propios pasos."),
    check(/pytest/i.test(requirements), "requirements.txt incluye pytest", "Agrega `pytest>=8.0` a requirements.txt."),
    check(/(^|\n)\.venv\/?/i.test(gitignore), ".gitignore ignora .venv", "Agrega `.venv/` a .gitignore.")
  ];
}

function packageStructureDetails() {
  const requiredFiles = [
    "src/observer_practice/__init__.py",
    "src/observer_practice/observer.py",
    "src/observer_practice/suscriptores.py",
    "src/observer_practice/canal.py"
  ];

  return requiredFiles.map((filePath) => check(
    existsSync(filePath),
    `${filePath} existe`,
    `Crea el archivo ${filePath}.`
  ));
}

function suscriptorEmailDetails() {
  const source = readText("src/observer_practice/suscriptores.py");
  const dynamic = runPythonCheck(`
from observer_practice.suscriptores import SuscriptorEmail

suscriptor = SuscriptorEmail("Ana")
assert suscriptor.nombre == "Ana"
assert suscriptor.canal == "email"
assert isinstance(suscriptor.mensajes, list)
assert suscriptor.mensajes == []
suscriptor.actualizar("Primera noticia")
assert suscriptor.mensajes == ["Primera noticia"]
assert "Ana" in str(suscriptor)
`);

  return [
    check(/class\s+SuscriptorEmail\b/.test(source), "Existe la clase SuscriptorEmail", "Define `class SuscriptorEmail` en suscriptores.py."),
    check(/def\s+__init__\s*\(/.test(source), "SuscriptorEmail define __init__", "Agrega `__init__(self, nombre)`."),
    check(/def\s+actualizar\s*\(/.test(source), "SuscriptorEmail define actualizar", "Agrega `actualizar(self, mensaje)`."),
    check(dynamic.ok, "SuscriptorEmail guarda mensajes correctamente", dynamic.error || "Verifica atributos nombre, canal y mensajes.")
  ];
}

function observerContractDetails() {
  const observerSource = readText("src/observer_practice/observer.py");
  const suscriptoresSource = readText("src/observer_practice/suscriptores.py");
  const dynamic = runPythonCheck(`
from observer_practice.suscriptores import SuscriptorSMS

suscriptor = SuscriptorSMS("Luis")
assert suscriptor.nombre == "Luis"
assert suscriptor.canal == "sms"
assert isinstance(suscriptor.mensajes, list)
suscriptor.actualizar("Mensaje SMS")
assert suscriptor.mensajes == ["Mensaje SMS"]
`);

  return [
    check(/Protocol|ABC|abstractmethod/.test(observerSource), "observer.py define un contrato de observador", "Usa `Protocol` o una clase abstracta para exigir `actualizar`."),
    check(/actualizar\s*\(/.test(observerSource), "El contrato menciona actualizar", "El contrato debe declarar `actualizar(self, mensaje)`."),
    check(/class\s+SuscriptorSMS\b/.test(suscriptoresSource), "Existe la clase SuscriptorSMS", "Define `class SuscriptorSMS` en suscriptores.py."),
    check(dynamic.ok, "SuscriptorSMS guarda mensajes correctamente", dynamic.error || "Verifica atributos nombre, canal y mensajes.")
  ];
}

function canalDetails() {
  const source = readText("src/observer_practice/canal.py");
  const dynamic = runPythonCheck(`
from observer_practice.canal import CanalNoticias
from observer_practice.suscriptores import SuscriptorEmail

canal = CanalNoticias("Python")
suscriptor = SuscriptorEmail("Ana")
assert canal.nombre == "Python"
assert hasattr(canal, "observadores")
assert canal.ultimo_mensaje is None
canal.suscribir(suscriptor)
canal.suscribir(suscriptor)
assert canal.observadores.count(suscriptor) == 1
canal.desuscribir(suscriptor)
assert suscriptor not in canal.observadores
`);

  return [
    check(/class\s+CanalNoticias\b/.test(source), "Existe la clase CanalNoticias", "Define `class CanalNoticias` en canal.py."),
    check(/def\s+suscribir\s*\(/.test(source), "CanalNoticias define suscribir", "Agrega `suscribir(self, observador)`."),
    check(/def\s+desuscribir\s*\(/.test(source), "CanalNoticias define desuscribir", "Agrega `desuscribir(self, observador)`."),
    check(dynamic.ok, "CanalNoticias administra observadores sin duplicarlos", dynamic.error || "Revisa observadores, suscribir y desuscribir.")
  ];
}

function observerBehaviorDetails({ runPytest = true } = {}) {
  const source = readText("src/observer_practice/canal.py");
  const dynamic = runPythonCheck(`
from observer_practice.canal import CanalNoticias
from observer_practice.suscriptores import SuscriptorEmail, SuscriptorSMS

canal = CanalNoticias("Python al dia")
email = SuscriptorEmail("Ana")
sms = SuscriptorSMS("Luis")

canal.suscribir(email)
canal.suscribir(sms)
canal.publicar("Nueva clase")

assert canal.ultimo_mensaje == "Nueva clase"
assert email.mensajes == ["Nueva clase"]
assert sms.mensajes == ["Nueva clase"]

canal.desuscribir(email)
canal.publicar("Solo activos")

assert email.mensajes == ["Nueva clase"]
assert sms.mensajes == ["Nueva clase", "Solo activos"]
`);
  const pytest = runPytest ? runCommand("python3", ["-m", "pytest", "-q"]) : { ok: true, output: "" };

  return [
    check(/def\s+notificar\s*\(/.test(source), "CanalNoticias define notificar", "Agrega `notificar(self, mensaje)`."),
    check(/def\s+publicar\s*\(/.test(source), "CanalNoticias define publicar", "Agrega `publicar(self, mensaje)`."),
    check(dynamic.ok, "Observer notifica y respeta desuscripcion", dynamic.error || "Revisa publicar, notificar y actualizar."),
    check(pytest.ok, "Las pruebas de pytest pasan", pytest.output || "Ejecuta `python -m pytest` y corrige los fallos.")
  ];
}

function demoDetails() {
  const mainPath = "src/main.py";
  const source = readText(mainPath);
  const execution = existsSync(mainPath)
    ? runCommand("python3", [mainPath])
    : { ok: false, output: "No existe src/main.py." };
  const hasUsefulOutput = execution.ok && /Observer|noticia|mensaje|Python|\[|Ana|Luis/i.test(execution.output);

  return [
    check(existsSync(mainPath), "src/main.py existe", "Crea src/main.py."),
    check(/CanalNoticias/.test(source), "La demo usa CanalNoticias", "Importa y usa CanalNoticias en main.py."),
    check(/SuscriptorEmail/.test(source) && /SuscriptorSMS/.test(source), "La demo usa dos tipos de suscriptor", "Importa y usa SuscriptorEmail y SuscriptorSMS."),
    check(/publicar\s*\(/.test(source), "La demo publica un mensaje", "Llama `canal.publicar(...)`."),
    check(execution.ok && hasUsefulOutput, "La demo se ejecuta y muestra salida", execution.output || "Ejecuta `python src/main.py` y muestra el resultado.")
  ];
}

function finalReadmeDetails() {
  const readme = readText("README.md");
  const clases = sectionContent(readme, "Crear clases en Python");
  const observer = sectionContent(readme, "Implementar Observer paso a paso");
  const pruebas = sectionContent(readme, "Ejecutar pruebas");
  const autores = sectionContent(readme, "Autores");

  return [
    ...validateReadmeStructure(readme),
    check(/SuscriptorEmail/i.test(clases), "README explica SuscriptorEmail", "Explica la clase SuscriptorEmail en Clases principales."),
    check(/SuscriptorSMS/i.test(clases) || /SuscriptorSMS/i.test(observer), "README explica SuscriptorSMS", "Explica la clase SuscriptorSMS en la guia."),
    check(/CanalNoticias/i.test(clases) || /CanalNoticias/i.test(observer), "README explica CanalNoticias", "Explica la clase CanalNoticias en la guia."),
    check(/sujeto|observable|CanalNoticias/i.test(observer), "README identifica el sujeto observable", "Indica que CanalNoticias es el sujeto observable."),
    check(/observador|suscriptor|Suscriptor/i.test(observer), "README identifica los observadores", "Indica que los suscriptores son observadores."),
    check(/python\s+src\/main\.py/i.test(readme), "README indica como ejecutar la demo", "Agrega `python src/main.py`."),
    check(/python\s+-m\s+pytest/i.test(pruebas), "README indica como ejecutar pytest", "Agrega `python -m pytest`."),
    check(!/completa esta seccion|pistas esperadas|reemplaza|reemplazar|pendiente/i.test(readme), "README no conserva textos pendientes del template", "Reemplaza las pistas y textos pendientes por informacion final."),
    check(autores.length >= 10 && !/reemplaza|reemplazar|pendiente|nombre/i.test(autores), "README tiene autores reales", "Reemplaza el texto pendiente de Autores.")
  ];
}

function category(key, text, points, details) {
  return {
    key,
    text,
    points,
    ok: details.every((item) => item.ok),
    details
  };
}

export function getPracticeChecks(options = {}) {
  const runPytest = options.runPytest ?? true;

  return {
    venv: category("venv", "Entorno virtual documentado y dependencias", 10, venvDetails()),
    packageStructure: category("package", "Estructura de paquete Python", 10, packageStructureDetails()),
    suscriptorEmail: category("email", "Clase SuscriptorEmail", 15, suscriptorEmailDetails()),
    observerContract: category("contract", "Contrato de observador y SuscriptorSMS", 10, observerContractDetails()),
    canal: category("canal", "Clase CanalNoticias", 15, canalDetails()),
    observerBehavior: category("observer", "Comportamiento Observer y pruebas", 20, observerBehaviorDetails({ runPytest })),
    demo: category("demo", "Demo ejecutable", 10, demoDetails()),
    readme: category("readme", "README final", 10, finalReadmeDetails())
  };
}

export function calculateScore(options = {}) {
  const categories = Object.values(getPracticeChecks(options));
  const total = categories.reduce((sum, item) => sum + (item.ok ? item.points : 0), 0);

  return { total, categories };
}

export function formatScoreMarkdown(score) {
  const lines = [
    `**Calificacion automatica:** ${score.total}/100`,
    "",
    "### Rubrica",
    ...score.categories.map((item) => {
      const mark = item.ok ? "[x]" : "[ ]";
      return `- ${mark} ${item.text}: ${item.ok ? item.points : 0}/${item.points}`;
    })
  ];

  const pending = score.categories
    .flatMap((item) => item.details.filter((detail) => !detail.ok).map((detail) => detail.fix || detail.text))
    .filter(Boolean);

  if (pending.length > 0) {
    lines.push("", "### Para mejorar");
    for (const fix of pending.slice(0, 12)) {
      lines.push(`- ${fix}`);
    }
  }

  return lines.join("\n");
}

function printScore(score) {
  console.log(`Calificacion automatica: ${score.total}/100`);
  console.log("");

  for (const item of score.categories) {
    console.log(`${item.ok ? "[OK]" : "[FALTA]"} ${item.text}: ${item.ok ? item.points : 0}/${item.points}`);
    for (const detail of item.details) {
      console.log(`  ${detail.ok ? "[OK]" : "[ ]"} ${detail.text}`);
      if (!detail.ok && detail.fix) {
        console.log(`      Sugerencia: ${detail.fix}`);
      }
    }
  }
}

function main() {
  const strict = process.argv.includes("--strict");
  const scoreMode = process.argv.includes("--score");
  const score = calculateScore({ runPytest: true });

  printScore(score);

  if (scoreMode) {
    return;
  }

  if (strict && score.total < 100) {
    process.exit(1);
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  main();
}
