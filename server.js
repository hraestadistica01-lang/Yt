const express = require('express');
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const app = express();

app.use(express.static('public'));

// Función para generar un agente que engañe a YouTube
const agent = ytdl.createAgent(); 

app.get('/buscar', async (req, res) => {
    try {
        const query = req.query.q;
        const resultado = await yts(query);
        res.json(resultado.videos.slice(0, 10));
    } catch (e) {
        res.status(500).json({ error: "Error en búsqueda" });
    }
});

app.get('/ver', async (req, res) => {
    const id = req.query.id;
    const url = `https://www.youtube.com/watch?v=${id}`;

    try {
        // Obligamos a usar el formato 18 (MP4 360p) que es el menos propenso a errores 429
        res.setHeader('Content-Type', 'video/mp4');

        const stream = ytdl(url, {
            agent: agent,
            quality: '18', 
            app: {
                name: 'com.google.android.youtube',
                version: '17.31.35',
                client: 'ANDROID'
            }
        });

        stream.on('error', (err) => {
            console.log("Error en el stream capturado:", err.message);
            if (!res.headersSent) {
                res.status(500).send("YouTube nos está limitando (Error 429/403)");
            }
        });

        stream.pipe(res);

    } catch (e) {
        res.status(500).send("Error crítico al obtener el video");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en marcha`));
