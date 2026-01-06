const express = require('express');
const ytdl = require('@distube/ytdl-core'); 
const yts = require('yt-search');
const app = express();

app.use(express.static('public'));

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
        // Configuramos cabeceras para que el navegador sepa que viene un video
        res.setHeader('Content-Type', 'video/mp4');

        // USAMOS FORMATO 18: Es el más compatible para servidores en la nube
        const stream = ytdl(url, {
            quality: '18', 
            agent: ytdl.createAgent(), // Intenta usar cookies internas para evitar bloqueos
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            }
        });

        stream.on('error', (err) => {
            console.error("Error en el stream:", err.message);
            // Si el error es 403, YouTube nos bloqueó la IP de Render
        });

        stream.pipe(res);

    } catch (e) {
        console.error("Error crítico:", e.message);
        res.status(500).send("Error al conectar con el video");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo`));
