# scribblelive-node
A node.js library for ScribbleLive

##Install
    npm install scribblelive

##Objects

###Post
	{ 
		id: 1234,
		content: 'Hello world',
		creator: { id: 1234, name: 'Jonathan Keebler', avatar: '' },
		is: { comment: false, deleted: false, stuck: false, approved: true },
		source: '',
		type: 'TEXT',
		date: 
		{ 
			created: "Wed Jan 21 2015 22:50:36 GMT-0500 (EST)",
			modified: "Wed Jan 21 2015 22:50:36 GMT-0500 (EST)" 
		}
	}


##Usage    

###Setup
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
		content: "Hello world"
	}, function(err, post)
	{
		...
	});
	
###Get the posts in an event
	scribble.client(1234).event(5678).posts().get(function(err, posts)
	{
		...
	});
	
###Get a client's live events
	scribble.client(1234).events().get(function(err, events)
	{
		...
	});
	
###Delete an event
	scribble.client(1234).event(5678).delete(function(err, success)
	{
		...
	});
