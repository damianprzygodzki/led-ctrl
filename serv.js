var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ws = require('../lib/ws281x-native');

const NUM_LEDS = 16;
var pixelData = new Uint32Array(NUM_LEDS);

ws.init(NUM_LEDS);

process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

function parseHtmlColor(color) {
	var col = color.match(/^#([0-9a-f]{6})$/i)[1];
	if (col) {
		return [
            		parseInt(m.substr(0,2),16),
            		parseInt(m.substr(2,2),16)
	}
}

function renderAll(color) {
	
	for(var i = 0; i < NUM_LEDS; i++) {
    		pixelData[i] = 0x + color;
	}
	ws.render(pixelData);
}


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.on('colorChange', function(color){
				 
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
