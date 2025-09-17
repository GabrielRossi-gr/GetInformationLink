const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'];
    const dataAcesso = new Date().toISOString();
    const referer = req.headers['referer'] || 'Direto'; // 'Direto' se não houver referer
    const idioma = req.headers['accept-language'];
    const sistemaOperacional = req.headers['sec-ch-ua-platform'];
    const protocolo = req.protocol;

    const info = {
        ip,
        userAgent,
        dataAcesso,
        referer,
        idioma,
        sistemaOperacional,
        protocolo
    };

    console.log(info);

    const logEntry = JSON.stringify(info) + '\n';
    fs.appendFileSync(logFile, logEntry);

    res.send('<h1> :)  </h1>');
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});