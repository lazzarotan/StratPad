import { execSync } from "child_process";

console.log("Seeding accounts...");
execSync("node prisma/seed.js", { stdio: "inherit" });

console.log("Seeding tags...");
execSync("node prisma/tagseed.js", { stdio: "inherit" });

console.log("All seeds complete.");