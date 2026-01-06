const express = require('express');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const app = express();

// Para que el servidor pueda leer archivos de la carpeta "public"
app.use(express.static('public'));

// 1. RUTA PARA BUSCAR VIDEOS
app.get('/buscar', async (req, res) => {
    const query = req.query.q;
    const resultado = await yts(query);
    // Enviamos solo los primeros 10 resultados
    res.json(resultado.videos.slice(0, 10));
});

// 2. RUTA TÚNEL (Aquí es donde ocurre la magia)
app.get('/ver', (req, res) => {
    const id = req.query.id;
    const url = `https://www.youtube.com/watch?v=${id}`;

    // Le decimos al navegador: "Esto es un video MP4"
    res.setHeader('Content-Type', 'video/mp4');

    // ytdl-core descarga el video de YT y lo envía (pipe) directamente a tu pantalla
    ytdl(url, { filter: 'audioandvideo', quality: 'highestvideo' }).pipe(res);
});


app.listen(3000, () => console.log("¡Servidor listo en el puerto 3000!"));
