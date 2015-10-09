//new client variables
var socket = io()
var myUsername;

//Username list
var userWrap = document.getElementById("users-wrap")
var currentUserList = document.querySelector(".user-list");
var userListItem = document.querySelector("li");
currentUserList.innerHTML = ""

//Chat input
var form = document.getElementById("msg-form");
form.onsubmit = submitMessage;
var msgWrap = document.getElementById("msg-wrap");
var msgTemplate = document.querySelector(".msg-template");
msgWrap.innerHTML = ""

//initialize socket connection
socket.on("connect", function(){
});

//prepopulate users list, get username
socket.on("initializeUsers", function(currentUsers){
	if (currentUsers.length !== 0) updateUsers(currentUsers);
	myUsername = prompt("Enter username:");
	socket.emit("userConnected", myUsername);
	var timestamp = new Date;
	var newUser = new NewMsg("Server", timestamp.toISOString(), myUsername + " has connected")
	socket.emit("newMsgSent", newUser)
});

//prepopulate history
socket.on("initializeHistory", function(chatHistory){
	console.log(chatHistory)
	if (chatHistory.length !==0){
		for (i=0; i<chatHistory.length; i++){
			recieveMessage(chatHistory[i])
		}
	}
});

//update user list with new users
socket.on("updateUsers", function(currentUsers){
	currentUserList.innerHTML = ""
	updateUsers(currentUsers)
});

//recieve and display message from other clients
socket.on("newMsgRec", function(newMsg){
	recieveMessage(newMsg)
})

//removes and replaces user list for current users
function updateUsers(currentUsers){
	for (i=0; i<currentUsers.length; i++){
		var userListItemClone = userListItem.cloneNode(true);
		userListItemClone.textContent = currentUsers[i];
		currentUserList.appendChild(userListItemClone);
	}
}

//create/submit message as JSON and send to server, display message on self client
function submitMessage(event){
	event.preventDefault();
	var timestamp = new Date;
	var newMsg = new NewMsg(myUsername, timestamp.toISOString(), form.elements["new-msg"].value);
	socket.emit("newMsgSent", newMsg);
	console.log("message submitted");
	recieveMessage(newMsg);
};

//display messasge from other clients
function recieveMessage(newMsg){
	var msgTemplateClone = msgTemplate.cloneNode(true);
	msgTemplateClone.querySelector(".username").textContent = newMsg.username;
	msgTemplateClone.querySelector(".time").textContent = newMsg.timestamp;
	msgTemplateClone.querySelector(".msg").textContent = newMsg.message;
	msgWrap.appendChild(msgTemplateClone)

}

//message JSON constructor
function NewMsg(username, timestamp, message){
	this.username = username;
	this.timestamp = timestamp;
	this.message = message;
};



