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
	
	before(function(done)
	{
		scribble = new ScribbleLive(settings);
		done();
	});
	
	it("should exist", function(done)
	{
		should.exist(ScribbleLive);
		done();
	});
	
	it("should get an instance of itself", function(done)
	{	
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
			title: "Testing" + Date.now()
		}, function(err, event)
		{
			should.not.exist(err);
			should.exist(event);
			event.should.have.properties("id", "title");
			global.event_id = event.id;
			
			done();
		});
	});
	
	it("should add a post", function(done)
	{
		scribble.client(global.client_id).event(global.event_id).post(
		{
			content: "Hello world",
			creator:
			{
				name: "User" + Date.now() 
			}
		}, function(err, post)
		{
			should.not.exist(err);
			should.exist(post);
			post.should.have.properties("id", "content");
			
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
				posts[0].should.have.properties("id", "content");

				done();
			});
		}, 5000);
		
	});
	
	it("should get the posts in an event by page");
	
	it("should get an event", function(done)
	{
		scribble.client(global.client_id).event(global.event_id).get(function(err, event)
		{
			should.not.exist(err);
			should.exist(event);
			event.should.have.property("id").eql(global.event_id);
			
			done();
		});
	});
	
	it("should get the live events in a client", function(done)
	{
		scribble.client(global.client_id).events({live: true, max: 1}).get(function(err, events)
		{
			should.not.exist(err);
			should.exist(events);
			events.should.have.property("length").eql(1);
			events.forEach(function(event)
			{
				event.should.have.properties("id", "title");
			});
			events[0].should.have.property("id").eql(global.event_id);
			done();
		});
	});
	
	it("should end an event", function(done)
	{
		scribble.client(global.client_id).event(global.event_id).end(function(err, event)
		{
			should.not.exist(err);
			should.exist(event);
			event.should.have.property("id").eql(global.event_id);
			event.is.should.have.property("live").eql(false);
			
			done();
		});
	});
	
	it("should start an event", function(done)
	{
		scribble.client(global.client_id).event(global.event_id).start(function(err, event)
		{
			should.not.exist(err);
			should.exist(event);
			event.should.have.property("id").eql(global.event_id);
			event.is.should.have.property("live").eql(true);
			
			done();
		});
	});
	
	it("should allow references to different events to be stored", function(done)
	{
		var fake_event_id = Date.now();
		
		var client = scribble.client(global.client_id);
		
		var event_a = client.event(global.event_id);
		var event_b = client.event(fake_event_id);
		
		event_a.data.should.have.property("event_id").eql(global.event_id);
		event_b.data.should.have.property("event_id").eql(fake_event_id);
		event_a.data.should.have.property("client_id").eql(event_b.data.client_id);
		
		done();
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
	
	it("should get all the articles in a client", function(done)
	{
		scribble.client(global.client_id).articles().get(function(err, articles)
		{
			should.not.exist(err);
			should.exist(articles);
			articles.should.have.property("length").above(0);
			articles.forEach(function(article)
			{
				article.should.have.properties("id", "creator", "title", "is");
				global.article_id = article.id;
			});
			done();
		});
	});
	
	it("should get an article", function(done)
	{
		scribble.client(global.client_id).article(global.article_id).get(function(err, article)
		{
			should.not.exist(err);
			should.exist(article);
			article.should.have.properties("id", "creator", "title", "is");
			article.should.have.property("id").eql(global.article_id);
			done();
		});
	});
	
	// Hardcoded client for metrics testing
	client_id = 670;
	event_id = 39048;
	
	it("should get client metrics over a date range", function(done)
	{
		scribble.client(client_id).metrics().date(1411516800000,new Date(1412121599000)).get(function(err, overview)
		{
			should.not.exist(err);
			should.exist(overview);
			overview.length.should.eql(7);
			overview[0].should.have.property("date").eql(1411516800000);
			overview[0].should.have.property("pageviews").above(0);
			overview[0].should.have.property("uniques").above(0);
			overview[0].should.have.property("engagementminutes").above(0);
			done();
		});
	});
	
	it("should get all client metrics for today", function(done)
	{
		var today = new Date();
		today.setUTCHours(0);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);
		
		scribble
			.client(client_id)
			.metrics()
			.date("today")
			.get(function(err, overview)
			{
				should.exist(overview);
				overview.length.should.eql(1);
				overview[0].should.have.property("date").eql(today.getTime())
				overview[0].should.have.property("pageviews").above(0);
				overview[0].should.have.property("uniques").above(0);
				overview[0].should.have.property("engagementminutes").above(0);				
				done();
			});
		
	});
	
	it("should get just engagement minutes client metrics for today", function(done)
	{
		var today = new Date();
		today.setUTCHours(0);
		today.setUTCMinutes(0);
		today.setUTCSeconds(0);
		today.setUTCMilliseconds(0);
		
		scribble
			.client(client_id)
			.date("today")
			.metrics("engagementminutes").get(function(err, overview)
			{
				should.exist(overview);
				overview.length.should.eql(1);
				overview[0].should.have.property("date").eql(today.getTime())
				overview[0].should.not.have.property("pageviews");
				overview[0].should.not.have.property("uniques");
				overview[0].should.have.property("engagementminutes").above(0);				
				done();
			});
		
	});
	
	it("should get metric totals for an event", function(done)
	{
		scribble.client(client_id).event(event_id).metrics("engagementminutes", "pageviews", "uniques").get(function(err, ems)
		{
			should.not.exist(err);
			should.exist(ems);
			ems.should.have.property("engagementminutes").above(0);
			ems.should.have.property("pageviews").above(0);
			ems.should.have.property("uniques").above(0);
			
			scribble.client(client_id).event(event_id).metrics("pageviews", "uniques").get(function(err, ems)
			{
				should.not.exist(err);
				should.exist(ems);
				ems.should.not.have.property("engagementminutes");
				ems.should.have.property("pageviews").above(0);
				ems.should.have.property("uniques").above(0);
				done();
			});
		});
	});
	
	it("should make a page hit to metrics", function(done)
	{
		scribble
			.client(client_id)
			.event(event_id)
			.metrics()
			.hit(
			{ 
				first: true, 
				referrer: "http://www.censes.io" 
			}, function(err)
			{
				should.not.exist(err);
				done();
			});
	});
	
	// Hardcoded client for metrics testing
	client_id = 17637;
	
	it("should get the audience for a client", function(done)
	{
		scribble
			.client(client_id)
			.audience()
			.get(
			function(err, profiles)
			{
				should.not.exist(err);
				should.exist(profiles);
				console.log(profiles);
				profiles.should.have.property("length").above(1);
				done();
			});
	})
});