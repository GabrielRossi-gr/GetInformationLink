const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const axios = require('axios'); 



const logFile = path.join(__dirname, 'acessos.txt');

app.get('/', async (req, res) => {
    // const ip = req.headers['x-forwarded-for'] || req.ip;
    const allIps = req.headers['x-forwarded-for'] || req.ip;
    const clientIp = allIps.split(',')[0].trim();

    const userAgent = req.headers['user-agent'];
    const dataAcesso = new Date().toISOString();
    const referer = req.headers['referer'] || 'Direto';
    const idioma = req.headers['accept-language'];
    const sistemaOperacional = req.headers['sec-ch-ua-platform'] || 'Não disponível';
    const protocolo = req.protocol;

    let latitude = ""
    let longitude = ""
    let country = ""
    let city = ""
    let locGeneralData = ""

    try {
        const response = await axios.get(`http://ip-api.com/json/${clientIp}`);
        const data = response.data;

        if (data.status === 'success') {
            latitude = data.lat;
            longitude = data.lon;
            country = data.country
            city = data.city
            locGeneralData = data

        } else {
            latitude = "none"
            longitude = "none"
            country = "none"
            city = "none"
            locGeneralData = "none"
        }
    } catch (error) {
        latitude = "none"
        longitude = "none"
        country = "none"
        city = "none"
        locGeneralData = "none"
    }

    const info = {
        "ip": clientIp,
        "localization": {
            "latitude": latitude,
            "longitude": longitude,
            "country": country,
            "city": city,
            generalData: {
                locGeneralData
            }
        },
        "ips": allIps,
        "sistemaOperacional": sistemaOperacional,
        "userAgent": userAgent,
        "date": dataAcesso,
        "referer": referer,
        "idioma": idioma,
        "protocolo": protocolo
    };


    console.log(info);
    const logEntry = JSON.stringify(info) + '\n';
    try {
        fs.appendFileSync(logFile, logEntry);
    } catch (err) {
        console.error('Erro ao escrever no arquivo de log:', err);
    }

    res.send('<h1> :( </h1>');
});



app.get('/log', (req, res) => {
    try {
        const data = fs.readFileSync(logFile, 'utf8');
        res.send(`
            <h1>Log de Acessos</h1>
            <pre>${data}</pre>
        `);
    } catch (err) {
        res.status(404).send('<h1>Arquivo de log não encontrado ou vazio.</h1>');
    }
});


app.get('/log1', (req, res) => {
    try {
        const data = fs.readFileSync(logFile, 'utf8');

        if (!data) {
            return res.json([]);
        }
        
        const linhas = data.split('\n');
        const listaDeObjetos = linhas.map(linha => {
            try {
                return JSON.parse(linha);
            } catch (e) {
                return null;
            }
        });

        const logFinal = listaDeObjetos.filter(objeto => objeto !== null);
        res.json(logFinal);
    } catch (err) {
        res.status(404).json({ error: 'Arquivo de log não encontrado.' });
    }
});


// Rota para limpar o log
app.get('/clear', (req, res) => {
    // ... e essa rota usa a mesma variável 'logFile'
    try {
        fs.writeFileSync(logFile, '');
        res.send('<h1>Log de acessos limpo com sucesso!</h1>');
    } catch (err) {
        console.error('Erro ao limpar o arquivo de log:', err);
        res.status(500).send('<h1>Erro ao limpar o log de acessos.</h1>');
    }
});

app.get('/localizar/:ip', async (req, res) => {
    const clientIp = req.params.ip;

    try {
        const response = await axios.get(`http://ip-api.com/json/${clientIp}`);
        const data = response.data;

        if (data.status === 'success') {
            const latitude = data.lat;
            const longitude = data.lon;

            res.send(`
                <h1>Localização do IP: ${clientIp}</h1>
                <p><strong>País:</strong> ${data.country}</p>
                <p><strong>Cidade:</strong> ${data.city}</p>
                <p><strong>Latitude:</strong> ${latitude}</p>
                <p><strong>Longitude:</strong> ${longitude}</p>

                <h3>${data}</h3>
            `);
        } else {
            res.status(404).send(`
                <h1>Erro 404</h1>
                <p>Não foi possível encontrar a localização para este IP: ${clientIp}.</p>
            `);
        }
    } catch (error) {
        console.error('Erro ao chamar a API de geolocalização:', error);
        res.status(500).send(`
            <h1>Erro 500</h1>
            <p>Erro interno no servidor ao tentar localizar o IP: ${clientIp}.</p>
        `);
    }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});