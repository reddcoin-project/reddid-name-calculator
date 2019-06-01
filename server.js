const http = require('http');
const axios = require('axios');
const express = require('express');

let app = express();
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile('/index.html');
});

app.get('/price/rdd', function(req, res) {
  const Url = 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-RDD';
  axios.get(Url).then(response => {
    res.json(response.data);
  }).catch(err => {
    console.log(err);
  });
});

app.get('/price/btc', function(req, res) {
  const Url = 'https://bittrex.com/api/v1.1/public/getticker?market=USD-BTC';
  axios.get(Url).then(response => {
    res.json(response.data);
  }).catch(err => {
    console.log(err);
  });
});

function startServer(){
  const httpServer = http.createServer(app);

  let httpPort = 3214;
  let listeningIp = '192.168.0.112';

// http server
  httpServer.listen(httpPort, listeningIp, () => {
    console.log(`http server starting on ${listeningIp} and listening on port: ${httpPort}`)
  });
}

startServer()
