import { readdir } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { join } from "path";
const { file: bunFile, write: bunWrite } = Bun;

const files = ["*.css", "*.html"];
const source = './src';
const destination = './dist';

// Create destination directory if it doesn't exist
async function createDestinationDir(dest) {
    try {
        await mkdir(dest, { recursive: true });
        console.log(`Directory created: ${dest}`);
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

// Function to get all files in a directory with specific extensions
async function getFilesWithExtensions(dir, exts) {
    const allFiles = await readdir(dir);
    return allFiles.filter(file => exts.some(ext => file.endsWith(ext.replace('*', ''))));
}

// Function to copy files
async function copyFiles(sourceDir, destDir, extensions) {
    const filesToCopy = await getFilesWithExtensions(sourceDir, extensions);
    for (const file of filesToCopy) {
        const sourceFile = join(sourceDir, file);
        const destFile = join(destDir, file);
        const fileContent = bunFile(sourceFile);
        await bunWrite(destFile, fileContent);
        console.log(`Copied ${sourceFile} to ${destFile}`);
    }
}

// Main function
async function main() {
    await createDestinationDir(destination);
    await copyFiles(source, destination, files);
    console.log('All files copied successfully!');
}

main().catch(err => console.error(err));
