var express = require("express");
var app = express()

var path = require("path");
var publicPath = path.join(__dirname, "public");

var staticServer = express.static(publicPath);
app.use(staticServer)

var port = process.env.PORT || 8080;
var server = app.listen(port);
var io = require("socket.io")(server);

var currentUsers = []
var chatHistory = []

io.on("connection", function(socket){
	//sends current users and chat history for initialize
	socket.emit("initializeUsers", currentUsers)
	socket.emit("initializeHistory", chatHistory)

	//lexical scope variable
	var thisUser;

	//adds new user to user array, updates all clientuser lists
	socket.on("userConnected", function(newUsername){
		thisUser = newUsername;
		currentUsers.push(thisUser);
		io.emit("updateUsers", currentUsers)
	})

	//removes user from list after disconnect
	socket.on("disconnect", function(){
		currentUsers.splice(currentUsers.indexOf(thisUser), 1);
		var timestamp = new Date;
		var leaver = {"username": "Server", "timestamp": timestamp, "message": thisUser + " says adios"};
		io.emit("newMsgRec", leaver);
		io.emit("updateUsers", currentUsers);
		if (currentUsers.length === 0) chatHistory = []
	})

	//recieves message and and sends to all other clients
	socket.on("newMsgSent", function(newMsg){
		chatHistory.push(newMsg);
		socket.broadcast.emit("newMsgRec", newMsg)
	})
})