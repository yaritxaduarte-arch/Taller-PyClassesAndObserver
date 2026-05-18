import { readFileSync } from "node:fs";
import { REQUIRED_README_SECTIONS, validateReadmeStructure } from "./validate-python-practice.js";

function main() {
  let readme;

  try {
    readme = readFileSync("README.md", "utf8");
  } catch (error) {
    console.error("[ERROR] No se encontro README.md en la raiz del repositorio.");
    console.error(error.message);
    process.exit(1);
  }

  const checks = validateReadmeStructure(readme);

  for (const [index, check] of checks.entries()) {
    const section = REQUIRED_README_SECTIONS[index];
    const marker = `${"#".repeat(section.level)} ${section.text}`;
    console.log(`${check.ok ? "[OK]" : "[FALTA]"} ${marker}`);
  }

  const missing = checks.filter((item) => !item.ok);
  if (missing.length > 0) {
    console.error("");
    console.error("El README no cumple la estructura minima solicitada.");
    process.exit(1);
  }

  console.log("");
  console.log("README validado correctamente.");
}

main();

