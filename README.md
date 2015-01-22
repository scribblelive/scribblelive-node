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
	
###References
The following lines are equivalent
	
	scribble.client(1234).event(4567).start();
	
	var client = scribble.client(1234);
	client.event(4567).start();
	
	var event = scribble.client(1234).event(4567);
	event.start();
	
###Get an existing event
	scribble.client(1234).event(5678).get(function(err, event)
	{
		...			
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
	var options = null; // all posts
	options = {page: 10, size: 50}; // posts on page 10 where each page has 50 posts
	options = {page: "last", size: 50}; // posts on the last page where each page has 50 posts

	scribble.client(1234).event(5678).posts(options).get(function(err, posts)
	{
		...
	});
	
###Get a client's events
	var options = null; // all events
	options = {live: true}; // just the live events
	options = {live: true, upcoming: true}; // just the live or upcoming events
	options = {max: 10}; // return up to a maximum of 10 events
		
	scribble.client(1234).events(options).get(function(err, events)
	{
		...
	});

###Start an event
	scribble.client(1234).event(5678).start(function(err, event)
	{
		...
	});
	
###End an event
	scribble.client(1234).event(5678).end(function(err, event)
	{
		...
	});
	
###Delete an event
	scribble.client(1234).event(5678).delete(function(err, success)
	{
		...
	});
