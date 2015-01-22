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

scribblelive.prototype.get_user_auth = function(next)
{
	if(this.user_auth && new Date() - this.user_auth_lastupdated < 1 * 60 * 60 * 1000 ) 
	{
		next(null,this.user_auth);
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
					next(null, this.user_auth);
				}
				else
				{
					next(new Error("Could not get user authentication"));
				}
			  }.bind(this));
	}
	
};

scribblelive.prototype.get_events = function(next)
{
	superagent.agent()
		.get(API_ROOT + "/client/" + this.data.client_id + "/events/live?Token=" + this.token + "&format=Json")
		.query({
			Max: 50
		})
		.end(function(err, res)
		{
			next(err, res.body.Events);
		}.bind(this));
};

scribblelive.prototype.delete = function(next)
{
	this.getUserAuth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "/delete?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, true);
			}.bind(this));
		
	}.bind(this));
};

scribblelive.prototype.approve = function(next)
{
	var comment_id = this.data.post_id;
	
	if(comment_id)
	{
		this.getUserAuth(function(auth)
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
		}.bind(this));
	}
	else
	{
		next(new Error("No post id was passed"), false);
	}
};

scribblelive.prototype.create = function(event, next)
{
	event.Auth = auth;
	
	this.getUserAuth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/client/" + this.data.client_id + "/create?Token=" + this.token + "&format=Json")
			.query(event)
			.end(function(err, res)
			{
				if(err) throw err;

				next(err, res.body);
			}.bind(this));
		
	}.bind(this));
};

scribblelive.prototype.post = function(post, next)
{
	this.getUserAuth(function(auth)
	{
		post.Auth = auth;
		
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "?Token=" + this.token + "&format=Json")
			.query(post)
			.end(function(err, res)
			{
				if(res.body.Code && res.body.Code === 200 )
				{
					next(err, true);
				}
				else
				{
					next(new Error("Could not create comment"). false);
				}
			}.bind(this));
	});
	
};



module.exports = scribblelive;


