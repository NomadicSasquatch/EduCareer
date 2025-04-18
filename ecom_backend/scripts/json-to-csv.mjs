import fs from "node:fs/promises";
import { stringify } from "csv-stringify/sync";

const [,, inFile, outFile] = process.argv;
if (!inFile || !outFile) {
  console.error("Usage: node json-to-csv.mjs <in.json> <out.csv>");
  process.exit(1);
}

const raw = JSON.parse(await fs.readFile(inFile, "utf8"));

const rows = [];
function walkSuite(suite, parentTitles = []) {
  const fullPath = [...parentTitles, suite.title].filter(Boolean);
  for (const test of suite.tests) {
    rows.push({
      fullTitle: [...fullPath, test.title].join(" › "),
      file      : test.file || "",
      status    : test.state || "skipped",
      durationMs: test.duration ?? "",
      errMsg    : test.err?.message ?? "",
      errStack  : test.err?.estack   ?? ""
    });
  }
  for (const child of suite.suites) walkSuite(child, fullPath);
}
walkSuite(raw.results[0]);

const csv = stringify(rows, {
  header: true,
  columns: [
    { key: "fullTitle",  header: "Test"           },
    { key: "file",       header: "File"           },
    { key: "status",     header: "Status"         },
    { key: "durationMs", header: "Duration (ms)"  },
    { key: "errMsg",     header: "Error Message"  },
    { key: "errStack",   header: "Error Stack"    }
  ]
});

await fs.writeFile(outFile, csv);
console.log(`CSV written to ${outFile}`);