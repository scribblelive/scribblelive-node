var superagent = require("superagent"),
	Url = require('url'),
	dynamodb = null;

var API_ROOT = "https://apiv1secure.scribblelive.com/api/rest";

function scribblelive(setup, data)
{
	if(setup)
	{
		this.token = setup.token;
		this.credentials = setup.credentials;
		this.user_auth = null;
		this.user_auth_lastupdated = null;
	}
	
	if(data)
	{
		this.data = data;
	}
	else
	{
		this.data = {};
	}
};

scribblelive.prototype.client = function(client_id)
{
	this.data.client_id = client_id;
	return this;
};

scribblelive.prototype.event = function(event_id)
{
	this.data.event_id = event_id;
	return this;
};

scribblelive.prototype.post = function(post_id)
{
	this.data.post_id = post_id;
	return this;
};

scribblelive.prototype.posts = function()
{
	this.data.request_type = "posts";
	return this;
};

scribblelive.prototype.events = function()
{
	this.data.request_type = "events";
	return this;
};

scribblelive.prototype.get_user_auth = function(success, failure)
{
	if(this.user_auth && new Date() - this.user_auth_lastupdated < 1 * 60 * 60 * 1000 ) 
	{
		success(this.user_auth);
	}
	else
	{
		var agent = superagent.agent();
		agent
			.get(API_ROOT + "/user/?Token=" + this.token + "&format=Json")
			.auth(this.credentials.email, this.credentials.password)
			.end(function(err, res) {
				if(err) throw err;

				if(res.body.Auth)
				{
					this.user_auth = res.body.Auth;
					this.user_auth_lastupdated = new Date();
					success(this.user_auth);
				}
				else
				{
					failure(new Error("Could not get user authentication"));
				}
			  }.bind(this));
	}
	
};

scribblelive.prototype.get_events = function(next)
{
	this.get_user_auth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/client/" + this.data.client_id + "/events/live?Token=" + this.token + "&format=Json")
			.query({
				Max: 50,
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, res.body.Events);
			}.bind(this));
	}.bind(this), function(err)
	{
		next(err);
	});
	
};

scribblelive.prototype.get_posts = function(next)
{
	this.get_user_auth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "/all?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, res.body.Posts);
			}.bind(this));
	}.bind(this), function(err)
	{
		next(err);
	});
	
};

scribblelive.prototype.delete = function(next)
{
	this.get_user_auth(function(auth)
	{	
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "/delete?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, !err);
			}.bind(this));
		
	}.bind(this),
	function(err)
	{
		next(err, false);
	});
};

scribblelive.prototype.approve = function(next)
{
	var comment_id = this.data.post_id;
	
	if(comment_id)
	{
		this.get_user_auth(function(auth)
		{
			superagent.agent()
				.get(API_ROOT + "/post/" + comment_id + "/approve?Token=" + this.token + "&format=Json")
				.query({
					Auth: auth
				})
				.end(function(err, res)
				{
					if(err) throw err;

					next(null, true);
				}.bind(this));
		}.bind(this),
		function(err)
		{
			next(err, false);
		});
	}
	else
	{
		next(new Error("No post id was passed"), false);
	}
};

scribblelive.prototype.create = function(event, next)
{
	this.get_user_auth(function(auth)
	{
		event.Auth = auth;
		
		superagent.agent()
			.get(API_ROOT + "/client/" + this.data.client_id + "/create?Token=" + this.token + "&format=Json")
			.query(event)
			.end(function(err, res)
			{
				if(err) throw err;

				next(err, res.body);
			}.bind(this));
		
	}.bind(this), 
	function(err)
	{
		next(err);
	});
};

scribblelive.prototype.post = function(post, next)
{
	this.get_user_auth(function(auth)
	{
		post.Auth = auth;
		
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "?Token=" + this.token + "&format=Json")
			.query(post)
			.end(function(err, res)
			{
				if(res.body.Code && res.body.Code === 200 )
				{
					next(err);
				}
				else if(res.body.Id)
				{
					next(err, res.body);
				}
				else
				{
					next(new Error("Could not create comment"));
				}
			}.bind(this));
	}.bind(this), function(err)
	{
		next(err);
	});
	
};

scribblelive.prototype.get = function(next)
{
	switch(this.data.request_type)
	{
		case "posts":
			this.get_posts(next);
			break;
		case "events":
			this.get_events(next);
			break;
		default:
			next(new Error("Invalid api usage"));
			break;
	}
};



module.exports = scribblelive;


