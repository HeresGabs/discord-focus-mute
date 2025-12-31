const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = 3000; //Make sure to update your Dockerfile accordingly
const SECRET_KEY = process.env.SECRET_KEY; //CHANGE THIS IN YOUR ENV FILE

const MODES_DIR = path.join(__dirname, 'focus-modes');
let isRunning = false;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));


async function runFocusMode(filePath, modeName, shouldMute) {
    const actionName = shouldMute ? "MUTE" : "UNMUTE";
    console.log("=========================================");
    console.log(`FOCUS MODE CALLED : ${modeName} [Action: ${actionName}]`)
    isRunning = true;

    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found : ${filePath}`);
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const regex = /(?:await\s+)?fetch\(\s*(["'].*?["'])\s*,\s*(\{[\s\S]*?\})\);/g;
        const matches = [...fileContent.matchAll(regex)];

        console.log(`${modeName}: ${matches.length} requests found.`);

        let count = 0;
        for (const match of matches) {
            count++;
            const rawUrl = match[1];
            const rawOptions = match[2];

            try {
                const url = eval(rawUrl);
                const getOptions = new Function(`return ${rawOptions}`);
                const options = getOptions();

                if (options.body && typeof options.body === 'string') {
                    try {
                        const bodyObj = JSON.parse(options.body);

                        if (bodyObj.guilds) {
                            Object.keys(bodyObj.guilds).forEach(guildId => {
                                if (bodyObj.guilds[guildId]) {
                                    bodyObj.guilds[guildId].muted = shouldMute;
                                }
                            });
                        }

                        options.body = JSON.stringify(bodyObj);

                    } catch (parseErr) {
                        console.warn(`⚠️ Could not parse body JSON for modification: ${parseErr.message}`);
                    }
                }
                const response = await fetch(url, options);

                const icon = response.ok ? '✅' : '⚠️';
                console.log(`[${modeName}:${actionName} ${count}/${matches.length}] ${icon} ${response.status} | ${url.substring(0, 30)}...`);

            } catch (e) {
                console.error(`[${modeName} ${count}/${matches.length}] ❌ Error:`, e.message);
            }

            //Jitter so that discord doesn't block us, you can remove it at your own risk
            if (count < matches.length) {
                const jitter = Math.floor(Math.random() * (2400 - 1800 + 1) + 1800);
                await sleep(jitter);
            }
        }
        console.log(`🎉 Mode "${modeName}" (${actionName}) launched.`);

    } catch (err) {
        console.error(`FATAL ERROR ON ${modeName}:`, err);
    } finally {
        isRunning = false;
        console.log("=========================================");
        console.log("Ready for another command.");
    }
}

if (!fs.existsSync(MODES_DIR)) {
    console.log(`Creating directory ${MODES_DIR}...`);
    fs.mkdirSync(MODES_DIR);
}

const files = fs.readdirSync(MODES_DIR).filter(file => file.endsWith('.txt'));

app.use((req, res, next) => {
    if (req.path === '/') return next();

    const userKey = req.query.key;

    if (userKey !== SECRET_KEY) {
        console.warn(`🛑 Refused attempt to access a route : ${req.ip}`);
        return res.status(401).json({
            status: 'error',
            message: 'Missing secret key.'
        });
    }

    next();
});

console.log("GENERATING ENDPOINTS");

if (files.length === 0) {
    console.warn("⚠️  No .txt files found in 'focus-modes'. Add files to create routes.");
}

files.forEach(file => {
    const routeName = path.parse(file).name;
    const fullPath = path.join(MODES_DIR, file);

    app.get(`/${routeName}/mute`, (req, res) => {
        if (isRunning) return sendBusy(res);

        res.json({ status: 'success', message: `Muting mode: ${routeName}` });
        runFocusMode(fullPath, routeName, true);
    });

    app.get(`/${routeName}/unmute`, (req, res) => {
        if (isRunning) return sendBusy(res);

        res.json({ status: 'success', message: `Unmuting mode: ${routeName}` });
        runFocusMode(fullPath, routeName, false);
    });

    console.log(`Routes ready: /${routeName}/mute  AND  /${routeName}/unmute`);
});

function sendBusy(res) {
    return res.status(409).json({
        status: 'error',
        message: '❌ A focus mode is already running. Please wait.'
    });
}

// Root route
app.get('/', (req, res) => {
    const availableModes = fs.readdirSync(MODES_DIR)
        .filter(f => f.endsWith('.txt'))
        .map(f => path.parse(f).name);

    res.json({
        message: "API DISCORD FOCUS MANAGER",
        usage: "GET /<mode_name>/mute OR /<mode_name>/unmute",
        modes_detected: availableModes
    });
});

app.listen(PORT, () => {
    console.log(`\nServer listening on http://localhost:${PORT} \n`);
});