import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const assetGroups = [
  {
    dir: "public",
    files: ["deck-1.png", "deck-2.png", "deck-3.png"],
    quality: 82,
  },
  {
    dir: "public/lighttrip",
    files: Array.from({ length: 11 }, (_, index) => `lt-${index + 1}.png`),
    quality: 80,
  },
];

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

async function optimizeFile(sourcePath, quality) {
  const targetPath = sourcePath.replace(/\.png$/i, ".webp");
  const sourceBuffer = await fs.readFile(sourcePath);

  await sharp(sourceBuffer)
    .webp({
      quality,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(targetPath);

  const [sourceStats, targetStats] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(targetPath),
  ]);

  return {
    sourcePath,
    targetPath,
    sourceSize: sourceStats.size,
    targetSize: targetStats.size,
  };
}

async function main() {
  const results = [];

  for (const group of assetGroups) {
    for (const file of group.files) {
      const sourcePath = path.join(projectRoot, group.dir, file);
      results.push(await optimizeFile(sourcePath, group.quality));
    }
  }

  const totalSource = results.reduce((sum, item) => sum + item.sourceSize, 0);
  const totalTarget = results.reduce((sum, item) => sum + item.targetSize, 0);

  console.log("Optimized assets:");
  results.forEach((item) => {
    const relativeSource = path.relative(projectRoot, item.sourcePath);
    const relativeTarget = path.relative(projectRoot, item.targetPath);
    console.log(
      `- ${relativeSource} -> ${relativeTarget} (${formatKb(item.sourceSize)} -> ${formatKb(item.targetSize)})`,
    );
  });
  console.log(
    `Total: ${formatKb(totalSource)} -> ${formatKb(totalTarget)} (${(
      (1 - totalTarget / totalSource) *
      100
    ).toFixed(1)}% smaller)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
