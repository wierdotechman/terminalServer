var terminal = require('child_process').spawn('bash');
var util = require('util');
var path = require('path');
var sockets = [];
process.stdin.setEncoding('utf8');

terminal.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
	for (var item in sockets) {
		sockets[item].emit('stdout', {data: new String(data)});
	}
});

process.stdin.on('data', function (text) {
    console.log('received data:', util.inspect(text));
    if (text === 'quit\n') {
      console.log('"quit" received. Ending terminal session');
		terminal.stdin.end();
    }
    else terminal.stdin.write(text);
  });

terminal.on('exit', function (code) {
    console.log('child process exited with code ' + code);
});

setTimeout(function() {
    console.log('Sending stdin to terminal');
    terminal.stdin.write('echo "Hello $USER. Your machine runs since:"\n');
    terminal.stdin.write('uptime\n');

}, 1000);

var express = require('express');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + 'public/index.html');
});

io.on('connection', function(socket) {
	sockets.push(socket);
	console.log('a user connected');
	socket.on('stdin', function(stdin) {
		console.log('received:', stdin);
		terminal.stdin.write(stdin);
	})
});

http.listen(9003, function(){
  console.log('listening on *:9003');
});
