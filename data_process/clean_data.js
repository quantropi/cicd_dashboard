const fs = require('fs');
const path = require('path');

// Constants
const EXPIRE_TIME = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
const runsPath = path.join(__dirname, '..', 'public', 'data', 'runs.json');
const archivePath = path.join(__dirname, '..', 'public', 'data', 'runs_archive.json');

// Load existing data
let runs = JSON.parse(fs.readFileSync(runsPath, 'utf8'));
let archivedRuns = [];

// Try loading the archived data, or initialize an empty array if it doesn't exist
try {
    archivedRuns = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
} catch (error) {
    // If the file doesn't exist, we will initialize an empty array
    archivedRuns = [];
}

// Get the current date and calculate the cutoff date for expiration
const currentDate = new Date();
const cutoffDate = new Date(currentDate - EXPIRE_TIME);

// Separate the data into expired and non-expired runs
const [newRuns, expiredRuns] = runs.reduce(([newArr, oldArr], run) => {
    if (new Date(run.time) >= cutoffDate) {
        newArr.push(run);
    } else {
        oldArr.push(run);
    }
    return [newArr, oldArr];
}, [[], []]);

// Update the archived runs data
archivedRuns = archivedRuns.concat(expiredRuns);

// Save the cleaned data back to runs.json
fs.writeFileSync(runsPath, JSON.stringify(newRuns, null, 2));

// Save the archived data to runs_archive.json
fs.writeFileSync(archivePath, JSON.stringify(archivedRuns, null, 2));

console.log(`Moved ${expiredRuns.length} expired runs to the archive and cleaned up ${runsPath}.`);
