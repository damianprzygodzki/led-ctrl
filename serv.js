var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ws = require('rpi-ws281x-native');
var ds = require('ds18b20');
var lcd = require('lcd');

// LED init
const NUM_LEDS = 16;
var pixelData = new Uint32Array(NUM_LEDS);
// LCD init
const lcdIns = new lcd({
    rs: 16,
    e: 12,
    data: [26, 19, 13, 6],
    cols: 8,
    rows: 2
});
// THERM init
var thermo = null;
ds.sensors(function(err, ids) {
    thermo = ids[0];
});

ws.init(NUM_LEDS);

lcdIns.on('ready', function() {
    lcdIns.setCursor(0, 0);
    setInterval(function() {
        if(thermo){
            ds.temperature(thermo, function(err, value) {
                lcdIns.clear();
                lcdIns.print(value);
            });
        }
    }, 1000);
});

process.on('SIGINT', function () {
    ws.reset();
    lcdIns.clear();
    lcdIns.close();
    process.nextTick(function () { process.exit(0); });
});

function parseHtmlColor(color) {
    color = color.substr(1);
    return parseInt(color,16);
}

function renderAll(color,ids) {
    for(var i = 0; i < NUM_LEDS; i++) {
        if(ids === "all"){
            pixelData[i] = color;
        }else if(ids.indexOf(i) > -1){
            pixelData[i] = color;
        }
    }
    ws.render(pixelData);
}

function getRandomColorPart() {
    return parseInt(Math.floor((Math.random() * 255) + 1), 16);
}

function randomFade() {
    setInterval(function(){
        const color = "#" + getRandomColorPart() + getRandomColorPart() + getRandomColorPart();
        renderAll(parseHtmlColor(color, "all"));
    },30000);
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('colorChange', function(color, ids){
        renderAll(parseHtmlColor(color),ids);
    });
    socket.on('colorAutoFade', function(){
        randomFade();
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
