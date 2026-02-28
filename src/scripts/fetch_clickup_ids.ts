
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env vars manually since we are running this script directly
const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const TOKEN = process.env.CLICKUP_API_TOKEN;
const BASE_URL = 'https://api.clickup.com/api/v2';

if (!TOKEN) {
    console.error('Error: CLICKUP_API_TOKEN not found in .env');
    process.exit(1);
}

async function fetchAPI(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': TOKEN!,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${await response.text()}`);
    }
    return response.json();
}

async function main() {
    try {
        console.log('Fetching Teams...');
        const teamsData: any = await fetchAPI('/team');
        const teams = teamsData.teams;

        const hierarchy: any = {};

        for (const team of teams) {
            console.log(`Processing Team: ${team.name} (${team.id})`);
            hierarchy[team.name] = { id: team.id, spaces: {} };

            const spacesData: any = await fetchAPI(`/team/${team.id}/space?archived=false`);
            for (const space of spacesData.spaces) {
                console.log(`  Processing Space: ${space.name} (${space.id})`);
                hierarchy[team.name].spaces[space.name] = { id: space.id, folders: {}, lists: {} };

                // Get Folders
                const foldersData: any = await fetchAPI(`/space/${space.id}/folder?archived=false`);
                for (const folder of foldersData.folders) {
                    console.log(`    Processing Folder: ${folder.name} (${folder.id})`);
                    hierarchy[team.name].spaces[space.name].folders[folder.name] = { id: folder.id, lists: {} };

                    // Get Lists in Folder
                    const folderListsData: any = await fetchAPI(`/folder/${folder.id}/list?archived=false`);
                    for (const list of folderListsData.lists) {
                        console.log(`      Found List: ${list.name} (${list.id})`);
                        hierarchy[team.name].spaces[space.name].folders[folder.name].lists[list.name] = list.id;
                    }
                }

                // Get Folderless Lists in Space
                const spaceListsData: any = await fetchAPI(`/space/${space.id}/list?archived=false`);
                for (const list of spaceListsData.lists) {
                    console.log(`    Found Space List: ${list.name} (${list.id})`);
                    hierarchy[team.name].spaces[space.name].lists[list.name] = list.id;
                }
            }
        }

        const outputPath = path.resolve(__dirname, '../../clickup_hierarchy.json');
        fs.writeFileSync(outputPath, JSON.stringify(hierarchy, null, 2));
        console.log(`Hierarchy saved to ${outputPath}`);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
