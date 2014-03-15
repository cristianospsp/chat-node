
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var malandros_logados = new Array();


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());	
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app);
var io = require("socket.io").listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.enabled("browser client minification");
io.enabled("browser client etag");
io.enabled("browser client gzip");
io.set("log level", 1);
io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);

io.on("connection", function(socketClient){
	console.log("Novo Cliente Conectado...");

	socketClient.on("mensagem", function(mensagem){
		console.log("Autor: " + mensagem.autor + " - Mensagem : " + mensagem.message);
		socketClient.emit("mensagens-para-todos", mensagem);
		socketClient.broadcast.emit("mensagens-para-todos", mensagem);			
	});

	socketClient.on("novo-malandro", function(nome){
		console.log("Novo Malandro: " + nome);

		var achou = false;
		for (var i=0; i < malandros_logados.length; i++) {
			if (malandros_logados[i] == nome) {
				achou = true;
				break;		
			}
		}
		if (!achou) {
			malandros_logados[malandros_logados.length] = nome;
		}
		
		socketClient.emit("mostra-malandro", malandros_logados);
		socketClient.broadcast.emit("mostra-malandro", malandros_logados);			
	});
	
});