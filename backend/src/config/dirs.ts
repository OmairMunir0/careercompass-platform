import fs from "fs/promises";
import path from "path";

async function ensureFolder(folderPath: string) {
  try {
    await fs.access(folderPath);
  } catch {
    await fs.mkdir(folderPath, { recursive: true });
    console.log(`Created folder: ${folderPath}`);
  }
}

export async function ensureUploadDirs() {
  const rootDir = process.cwd();
  const uploadsDir = path.join(rootDir, "uploads");

  await ensureFolder(uploadsDir);

  const subfolders = ["resumes", "post-images", "profile-images", "certificates"];

  for (const sub of subfolders) {
    const folderPath = path.join(uploadsDir, sub);
    await ensureFolder(folderPath);
  }

  console.log("All upload folders are present and ready.");
}
