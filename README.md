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

###Event
	{
	  count: { comments: 0, posts: 0, syndicated_comments: 0 },
	  creator: { name: 'Jonathan Keebler' },
	  date: {
	    created: Thursday, January 22, 2015 00:57:57.000 GMT-0500,
	    end: Thursday, January 22, 2015 03:57:57.000 GMT-0500,
	    modified: Thursday, January 22, 2015 00:57:57.000 GMT-0500,
	    start: Thursday, January 22, 2015 00:57:57.000 GMT-0500
	  },
	  description: 'DESCRIPTION',
	  id: 1234,
	  is: {
	    commenting: false,
	    deleted: false,
	    discussion: false,
	    hidden: false,
	    live: true,
	    moderated: false,
	    syndicatable: false,
	    syndicated: false
	  },
	  language: 'en',
	  title: 'TITLE'
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
		title: "YOUR_TITLE"
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
