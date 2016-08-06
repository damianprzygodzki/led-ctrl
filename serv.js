var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ws = require('rpi-ws281x-native');

const NUM_LEDS = 16;
var pixelData = new Uint32Array(NUM_LEDS);

ws.init(NUM_LEDS);

process.on('SIGINT', function () {
    ws281x.reset();
    process.nextTick(function () { process.exit(0); });
});

function parseHtmlColor(color) {
    color = color.substr(1);
    return parseInt(color,16);
}

function renderAll(color) {
    for(var i = 0; i < NUM_LEDS; i++) {
        pixelData[i] = color;
    }
    ws.render(pixelData);
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('colorChange', function(color){
        renderAll(parseHtmlColor(color));
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
