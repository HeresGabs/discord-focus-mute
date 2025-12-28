const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 3000; // You can change the port if needed, make sure to update your Dockerfile accordingly

const FILE_NAME = '/app/data/server_requests_list.txt';
let isRunning = false;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

app.get('/start', async (req, res) => {
    if (isRunning) {
        return res.status(409).json({ status: 'error', message: 'The script is already running' });
    }
    if (!fs.existsSync(FILE_NAME)) {
        return res.status(404).json({ status: 'error', message: 'server_requests_list.txt not found.' });
    }

    res.json({ status: 'success', message: 'Reading script...' });

    isRunning = true;
    console.log("👓 Reading script...");

    try {
        const fileContent = fs.readFileSync(FILE_NAME, 'utf-8');
        const regex = /(?:await\s+)?fetch\(\s*(["'].*?["'])\s*,\s*(\{[\s\S]*?\})\);/g;
        const matches = [...fileContent.matchAll(regex)];

        console.log(`File opened: ${matches.length} fetch requests found.`);

        let count = 0;
        for (const match of matches) {
            count++;
            const rawUrl = match[1];
            const rawOptions = match[2];

            try {
                const url = eval(rawUrl);
                const getOptions = new Function(`return ${rawOptions}`);
                const options = getOptions();
                const response = await fetch(url, options);

                const icon = response.ok ? '✅' : '⚠️';
                console.log(`[${count}/${matches.length}] ${icon} Status: ${response.status} | URL: ${url.substring(0, 30)}...`);

            } catch (e) {
                console.error(`[${count}/${matches.length}] ❌ Parsing or network error :`, e.message);
            }

            //Jitter so that discord doesn't block us, you can remove it at your own risk
            if (count < matches.length) {
                const jitter = Math.floor(Math.random() * (2400 - 1800 + 1) + 1800);
                console.log(`⏳ ${jitter}ms pause so that discord does not block us...`);
                await sleep(jitter);
            }
        }

        console.log("🎉 All given servers muted.");

    } catch (err) {
        console.error("FATAL ERROR:", err);
    } finally {
        isRunning = false;
    }
});

app.listen(PORT, () => {
    console.log(`API Server ready on : http://localhost:${PORT}/start`);
});