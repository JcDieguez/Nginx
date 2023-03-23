const cluster = require('cluster');
const os = require('os');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
// Código para ejecutar en modo fork (por defecto)
const app = express();
app.use(compression());
// Loggeo a consola
app.use(morgan('combined'));

const mode = process.argv[2] || 'fork';

if (mode === 'cluster' && cluster.isMaster) {
  // Código para ejecutar en modo cluster
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    cluster.fork();
  });
} else {

  // Servidor individual escuchando en el puerto 8080
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  // Cluster de servidores escuchando en el puerto 8081
// if (cluster.isWorker || mode === 'fork') {
//   app.get('/api/randoms', (req, res) => {
//     const randomNum = Math.floor(Math.random() * 100);
//     res.send({random: randomNum});
//   });
// }

  const server = app.listen(8080, () => {
    console.log('API listening on port 8080');
  });

  if (cluster.isMaster && mode === 'cluster') {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
      cluster.fork();
    });
  }
}



// Loggeo de peticiones a archivo
const warnLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'warn.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'error.log'), { flags: 'a' });

app.use(morgan('combined', {
  stream: {
    write: (message) => {
      const statusCode = message.substring(0, 3);
      if (statusCode >= 400 && statusCode < 500) {
        warnLogStream.write(message);
      } else if (statusCode >= 500) {
        errorLogStream.write(message);
      }
      console.log(message);
    }
  }
}));

// Middleware para rutas inexistentes
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).send({error: 'Not found'});
  }
  const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${res.statusMessage}\n`;
  console.warn(message);
  warnLogStream.write(message);
});

const logsDir = path.join(__dirname, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}