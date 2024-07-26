import { readdir } from "node:fs/promises";
import { mkdir } from "node:fs/promises";
import { join } from "path";
const { file: bunFile, write: bunWrite } = Bun;

const files = [".css", ".html", ".svg"];
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

// Function to get all files in a directory and its subdirectories with specific extensions
async function getFilesWithExtensions(dir, exts, baseDir = '') {
    let results = [];
    const list = await readdir(dir, { withFileTypes: true });
    for (const file of list) {
        const filePath = join(dir, file.name);
        if (file.isDirectory()) {
            const subResults = await getFilesWithExtensions(filePath, exts, join(baseDir, file.name));
            results = results.concat(subResults);
        } else if (exts.some(ext => file.name.endsWith(ext.replace('*', '')))) {
            results.push(join(baseDir, file.name));
        }
    }
    return results;
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
