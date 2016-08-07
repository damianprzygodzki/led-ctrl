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
const lcdIns = new Lcd({
    rs: 16,
    e: 12,
    data: [26, 19, 13, 6],
    cols: 8,
    rows: 2
});
// THERM init
ds.sensors(function(err, ids) {
    const thermo = ids[0];
});

ws.init(NUM_LEDS);

lcd.on('ready', function() {
    lcd.setCursor(0, 0);
    setTimeout(function() {
        ds.temperature(thermo, function(err, value) {
            lcd.print(value);
        });
    }, 5000);
});

process.on('SIGINT', function () {
    ws.reset();
    lcd.clear();
    lcd.close();
    process.nextTick(function () { process.exit(0); });
});

function parseHtmlColor(color) {
    color = color.substr(1);
    return parseInt(color,16);
}

function renderAll(color,ids) {
    for(var i = 0; i < NUM_LEDS; i++) {
        if(ids.indexOf(i) > -1){
            pixelData[i] = color;
        }
    }
    ws.render(pixelData);
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    socket.on('colorChange', function(color, ids){
        renderAll(parseHtmlColor(color),ids);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
