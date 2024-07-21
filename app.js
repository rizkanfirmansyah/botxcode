const TeleBot = require("node-telegram-bot-api");
const os = require('os');
const { exec } = require('child_process');

const token = "7079643216:AAEq4p4ggHxNUMu8Ad68otC_PZd6AYcif2E";
const options = {
    polling: true
}

const xbot = new TeleBot(token, options)

console.log("Bot Already Running!!!!");

const prefix = "/"
const sayHi = /halo/
const gempa = new RegExp(`^${prefix}gempa$`)
const mem = new RegExp(`^${prefix}mem$`)
const cpu = new RegExp(`^${prefix}cpu$`)

xbot.onText(gempa, async (callback) => {
    const id = callback.from.id;
    const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";

    const apiCall = await fetch(BMKG_ENDPOINT + "autogempa.json");
    const { Infogempa:
        {
            gempa: {
                Jam, Magnitude, Tanggal, DateTime, Coordinates, Lintang, Shakemap, Dirasakan, Potensi, Wilayah, Kedalaman, Bujur
            }
        }
    } = await apiCall.json();

    const BMKGImage = BMKG_ENDPOINT + Shakemap;
    const resultText = `
Waktu : ${Tanggal} ${Jam}
Besaran: ${Magnitude} Sr
Wilayah: ${Wilayah}
Potensi: ${Potensi}
Kedalaman: ${Kedalaman}
Dirasakan: ${Dirasakan}
    `;

    xbot.sendPhoto(id, BMKGImage, {
        caption: resultText
    });
});

xbot.onText(mem, async (callback) => {
    const id = callback.from.id;
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024; // in MB
    const freeMemory = os.freemem() / 1024 / 1024 / 1024; // in MB
    const usedMemory = totalMemory - freeMemory; // in MB
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // in MB

    xbot.sendMessage(id, `
Memory Server Usage: ${memoryUsage.toFixed(2)} MB 
Usage Memory ${usedMemory.toFixed(2)} GB
Free Memory: ${freeMemory.toFixed(2)} GB
Total Memory ${totalMemory.toFixed(2)} GB
`);
});

xbot.onText(cpu, async (callback) => {
    const id = callback.from.id;
    // Get CPU usage
    // Total CPU Core Count
    const cpuCount = os.cpus().length;
    const cpuUsage = os.loadavg()[0] / cpuCount; // Load average per core

    console.log('CPU Usage:', (cpuUsage * 100).toFixed(2), '%');

    exec('wmic cpu get loadpercentage', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        xbot.sendMessage(id, `
CPU Core: ${cpuCount}Core
CPU Usage: ${stdout.trim()}%
    `);
    });

});