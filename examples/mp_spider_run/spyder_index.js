const path = require('path');
const jsdom = require('jsdom');
const canvas = require('canvas');

const express = require('express');
const app = express();
const server = require('http').Server(app);
var io = require('socket.io')(server);

const DatauriParser=require("datauri/parser");
const datauri = new DatauriParser();

const { JSDOM } = jsdom;

app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/spyders_client.html');
});


function setupAuthoritativePhaser() {
  JSDOM.fromFile(path.join(__dirname, 'index.html'), {
    // To run the scripts in the html file
    runScripts: "dangerously",
    // Also load supported external resources
    resources: "usable",
    // So requestAnimatinFrame events fire
    pretendToBeVisual: true
  }).then((dom) => {
    console.log('create blob')
    dom.window.gameLoaded = () => {

      dom.window.URL.createObjectURL = (blob) => {
        if (blob){
          return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
        }
      };
      console.log('blob created')
      dom.window.URL.revokeObjectURL = (objectURL) => {};

      dom.window.io = io;
      server.listen(8081, function () {
        console.log(`Listening on: ${server.address().port}`);
      });
    };
  }).catch((error) => {
    console.log(error.message);
  });
};
    setupAuthoritativePhaser();
 