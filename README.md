# scribblelive-node
A node.js library for ScribbleLive

##Install
    npm install

##Usage    

###Instantiate
    var ScribbleLive = require("scribblelive");
    var scribble = new ScribbleLive({
		token: "YOUR_TOKEN",
		credentials: {
			email: "you@example.com",
			password: "YOUR_PASSWORD"
		}
	});

###Create a new event
	scribble.client(1234).create(
	{
		Title: "YOUR_TITLE"
	}, function(err, event)
	{
		...			
	});

###Add a post
	scribble.client(1234).event(5678).post(
	{
		Content: "Hello world"
	}, function(err, post)
	{
		...
	});