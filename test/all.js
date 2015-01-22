var should = require('should'),
	superagent = require("superagent"),
	settings = require("./settings.js");
	ScribbleLive = require("../index.js");
	
describe("scribblelive-node", function()
{
	this.timeout(10000);
	
	var scribble = null;
	global.client_id = settings.client_id;
	var test_page = "/test/page/" +  Date.now();
	var user_comment = {};
	var API_ROOT = "http://localhost:3000";
	var event_id = null;
	var comments_moderation = [];
	
	it("should exist", function(done)
	{
		should.exist(ScribbleLive);
		done();
	});
	
	it("should get an instance of itself", function(done)
	{
		scribble = new ScribbleLive(settings);
		should.exist(scribble);
		scribble.should.have.property("token").eql("JuQNdxvZ");
		scribble.should.have.property("credentials");
		scribble.credentials.should.have.property("email").eql("jonathan+testing@censes.io");
		scribble.credentials.should.have.property("password").eql("31Qq+CCN&aB[B\"L");
		done();
	});
	
	it("should get a user auth token", function(done)
	{
		scribble.get_user_auth(function(success)
		{
			should.exist(success);
			scribble.should.have.property("user_auth").eql(success);
			done();
		}, function(err)
		{
			should.not.exist(err);
			done();
		});
	});
	
	it("should create a new event", function(done)
	{
		scribble.client(global.client_id).create({
			Title: "Testing" + Date.now()
		}, function(err, event)
		{
			should.not.exist(err);
			should.exist(event);
			event.should.have.properties("Id", "Title");
			global.event_id = event.Id;
			
			done();
		});
	});
	
	it("should get the events in a client", function(done)
	{
		scribble.client(global.client_id).events().get(function(err, events)
		{
			should.not.exist(err);
			should.exist(events);
			events.should.have.property("length").above(0);
			events.forEach(function(event)
			{
				event.should.have.properties("Id", "Title");
			});
			done();
		});
	});
	
	it("should add a post", function(done)
	{
		scribble.client(global.client_id).event(global.event_id).post(
		{
			Content: "Hello world",
			Creator: "User" + Date.now()
		}, function(err, post)
		{
			should.not.exist(err);
			should.exist(post);
			post.should.have.properties("Id", "Content");
			
			done();
		});
	});
	
	it("should get the posts in an event", function(done)
	{
		setTimeout(function()
		{
			scribble.client(global.client_id).event(global.event_id).posts().get(function(err, posts)
			{
				should.not.exist(err);
				should.exist(posts);
				posts.should.have.property("length").eql(1);
				posts[0].should.have.properties("Id", "Content");

				done();
			});
		}, 5000);
		
	});
		
	it("should delete the test event", function(done)
	{
		scribble.client(global.client_id).event(global.event_id).delete(function(err, success)
		{
			should.not.exist(err);
			should.exist(success);
			done();
		});
	});
	
});