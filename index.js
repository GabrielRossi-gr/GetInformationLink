const express = require('express');
const fs = require('fs'); // Módulo para trabalhar com o sistema de arquivos
const path = require('path'); // Módulo para lidar com caminhos de arquivo
const app = express();
const port = 3000;

// Define o caminho para o arquivo de log
const logFile = path.join(__dirname, 'acessos.txt');

app.get('/', (req, res) => {
    // Coleta as informações da requisição
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'];
    const dataAcesso = new Date().toISOString();
    const referer = req.headers['referer'] || 'Direto';
    const idioma = req.headers['accept-language'];
    const sistemaOperacional = req.headers['sec-ch-ua-platform'] || 'Não disponível';
    const protocolo = req.protocol;

    // Cria um objeto com todas as informações
    const info = {
        ip,
        userAgent,
        dataAcesso,
        referer,
        idioma,
        sistemaOperacional,
        protocolo
    };

    // Imprime o objeto no terminal (console.log)
    console.log(info);

    // Converte o objeto para uma string JSON e adiciona uma nova linha
    const logEntry = JSON.stringify(info) + '\n';

    // Adiciona a string JSON ao arquivo de log
    try {
        fs.appendFileSync(logFile, logEntry);
    } catch (err) {
        console.error('Erro ao escrever no arquivo de log:', err);
    }

    // Envia uma resposta simples ao navegador
    res.send('<h1> :) </h1>');
});



// Nova rota para ler e exibir o arquivo de log
app.get('/ver-log', (req, res) => {
    try {
        // Tenta ler o conteúdo do arquivo
        const data = fs.readFileSync(logFile, 'utf8');
        
        // Exibe o conteúdo em uma página HTML formatada
        res.send(`
            <h1>Log de Acessos</h1>
            <pre>${data}</pre>
        `);
    } catch (err) {
        // Se o arquivo não existir ou houver um erro, mostra uma mensagem
        res.status(404).send('<h1>Arquivo de log não encontrado ou vazio.</h1>');
    }
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});