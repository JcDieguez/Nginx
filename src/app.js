const cluster = require('cluster');
const os = require('os');
const express = require('express');

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
  // Código para ejecutar en modo fork (por defecto)
  const app = express();

  // Servidor individual escuchando en el puerto 8080
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  // Cluster de servidores escuchando en el puerto 8081
  if (cluster.isWorker || mode === 'fork') {
    app.get('/api/randoms', (req, res) => {
      const randomNum = Math.floor(Math.random() * 100);
      res.send({random: randomNum});
    });
  }

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