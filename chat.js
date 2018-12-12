window.webchat = {
	nickname: "undefined",
	channel: "main",
	onopen: () => {
		webchat.server.send(JSON.stringify({type: 7, data: {}}));
	},
	onclose: () => {
		var dmsg = document.createElement("div");
		dmsg.classList.add("message");
		var timestamp = document.createElement("span");
		timestamp.classList.add("timestamp");
		timestamp.appendChild(document.createTextNode(new Date().toLocaleTimeString()));
		var message = document.createElement("span");
		message.classList.add("content");
		message.classList.add("announcement");
		message.appendChild(document.createTextNode("Connection to the server has been lost."));
		dmsg.appendChild(timestamp);
		dmsg.appendChild(message);
		var chatbox = document.querySelector(".chat");
		chatbox.appendChild(dmsg);
		chatbox.scrollTop = chatbox.scrollHeight;
	},
	onmessage: raw => {
		webchat.lastMessage = Math.floor(Date.now() / 1000);
		var msg = JSON.parse(raw.data);
		if(msg.type === 2) {
			if(msg.data.channel === webchat.channel) {
				var dmsg = document.createElement("div");
				dmsg.classList.add("message");
				var timestamp = document.createElement("span");
				timestamp.classList.add("timestamp");
				timestamp.appendChild(document.createTextNode(new Date().toLocaleTimeString()));
				var nick = document.createElement("span");
				nick.classList.add("nickname");
				nick.style.color = msg.data.color;
				nick.appendChild(document.createTextNode(msg.data.nickname));
				var message = document.createElement("span");
				message.classList.add("content");
				message.appendChild(document.createTextNode(msg.data.message));
				dmsg.appendChild(timestamp);
				dmsg.appendChild(nick);
				dmsg.appendChild(message);
				var chatbox = document.querySelector(".chat");
				chatbox.appendChild(dmsg);
				chatbox.scrollTop = chatbox.scrollHeight;
			}
		} else if(msg.type === 5) {
			var dmsg = document.createElement("div");
			dmsg.classList.add("message");
			var timestamp = document.createElement("span");
			timestamp.classList.add("timestamp");
			timestamp.appendChild(document.createTextNode(new Date().toLocaleTimeString()));
			var message = document.createElement("span");
			message.classList.add("content");
			message.classList.add("announcement");
			message.appendChild(document.createTextNode(msg.data.message));
			dmsg.appendChild(timestamp);
			dmsg.appendChild(message);
			var chatbox = document.querySelector(".chat");
			chatbox.appendChild(dmsg);
			chatbox.scrollTop = chatbox.scrollHeight;
		} else if(msg.type === 6) {
			document.querySelector(".top").innerHTML = "";
			document.querySelector(".top").appendChild(document.createTextNode(msg.data.motd));
		} else if(msg.type === 8) {
			document.getElementById("nickname").value = msg.data.nickname;
			webchat.nickname = msg.data.nickname;
		} else if(msg.type === 10) {
			var users = document.querySelector(".users");
			users.innerHTML = "";
			msg.data.users.forEach(data => {
				var nickname = document.createElement("div");
				nickname.classList.add("nickname");
				nickname.style.color = data.color;
				nickname.appendChild(document.createTextNode(data.nickname));
				users.appendChild(nickname);
			});
		}
	},
	server: new WebSocket("ws://74.78.131.61:2277/"),
	send: () => {
		var nickname = document.getElementById("nickname");
		if(nickname.value !== webchat.nickname) {
			webchat.server.send(JSON.stringify({type: 4, data: {
				nickname: nickname.value
			}}));
			webchat.server.send(JSON.stringify({type: 7, data:{}}));
		}
		var msg = {type: 1, data: {
			channel: webchat.channel,
			message: document.getElementById("message").value
		}};
		webchat.server.send(JSON.stringify(msg));
		document.getElementById("message").value = "";
	}
};

webchat.server.onmessage = webchat.onmessage;
webchat.server.onclose = webchat.onclose;
webchat.server.onopen = webchat.onopen;

document.addEventListener("DOMContentLoaded", event => {
	document.getElementById("message").addEventListener("keypress", event => {
		if(event.keyCode === 13) {
			webchat.send();
		}
	});
});

setInterval(() => {
	webchat.server.send(JSON.stringify({type: 0, data: {}}));
	webchat.server.send(JSON.stringify({type: 9, data: {}}));
}, 1000);
