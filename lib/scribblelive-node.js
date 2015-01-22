var superagent = require("superagent"),
	Url = require('url'),
	Post = require("./models/post.js"),
	Article = require("./models/article.js"),
	Event = require("./models/event.js");

var API_ROOT = "https://apiv1secure.scribblelive.com/api/rest";

function scribblelive(setup, data)
{
	if(setup)
	{
		this.setup = setup;
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

scribblelive.prototype.clone = function()
{
	return new scribblelive(this.setup, JSON.parse(JSON.stringify(this.data)));
	
};

scribblelive.prototype.client = function(client_id)
{
	var copy = this.clone();
	copy.data.client_id = client_id;
	return copy;
};

scribblelive.prototype.event = function(event_id)
{
	var copy = this.clone();
	copy.data.event_id = event_id;
	return copy;
};

scribblelive.prototype.article = function(article_id)
{
	var copy = this.clone();
	copy.data.request_type = "article";
	copy.data.article_id = article_id;
	return copy;
};

scribblelive.prototype.post = function(post_id)
{
	var copy = this.clone();
	copy.data.post_id = post_id;
	return copy;
};

scribblelive.prototype.posts = function(options)
{
	var copy = this.clone();
	copy.data.request_type = "posts";
	copy.data.options = options || {};
	return copy;
};

scribblelive.prototype.events = function(options)
{
	var copy = this.clone();
	copy.data.request_type = "events";
	copy.data.options = options || {};
	return copy;
};

scribblelive.prototype.articles = function(options)
{
	var copy = this.clone();
	copy.data.request_type = "articles";
	copy.data.options = options || {};
	return copy;
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
		var event_type_path = "";
		if(this.data.options.upcoming && this.data.options.live)
		{
			event_type_path = "/liveandupcoming";
		}
		else if(this.data.options.live)
		{
			event_type_path = "/live";
		}
		
		superagent.agent()
			.get(API_ROOT + "/client/" + this.data.client_id + "/events" + event_type_path + "?Token=" + this.token + "&format=Json")
			.query({
				Max: this.data.options.max || 10,
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, Event.convert(res.body.Events));
			}.bind(this));
	}.bind(this), function(err)
	{
		next(err);
	});
	
};

scribblelive.prototype.get_event = function(next)
{
	this.get_user_auth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, Event.convert(res.body));
			}.bind(this));
	}.bind(this), function(err)
	{
		next(err);
	});
	
};

scribblelive.prototype.get_article = function(next)
{
	this.get_user_auth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/article/" + this.data.article_id + "?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				if(err || !res.body.Id)
				{
					next(err);
				}
				else
				{
					next(err, Article.convert(res.body));
				}
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
		var event_type_path = "/all";
		var api_query = {Auth: auth};
		
		if(this.data.options.page)
		{
			switch(this.data.options.page)
			{
				case "last":
					event_type_path: "/page/last";
					break;
				case "first":
					event_type_path: "/page/0";
					break;
				default:
					event_type_path: "/page/" + parseInt(this.data.options.page);
					break;
			}
			
			if(this.data.options.size)
			{
				api_query.PageSize = this.data.options.size;
			}
		}
		
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + event_type_path + "?Token=" + this.token + "&format=Json")
			.query(api_query)
			.end(function(err, res)
			{
				next(err, Post.convert(res.body.Posts));
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

scribblelive.prototype.end = function(next)
{
	this.get_user_auth(function(auth)
	{	
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "/close?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, Event.convert(res.body));
			}.bind(this));
		
	}.bind(this),
	function(err)
	{
		next(err, false);
	});
};

scribblelive.prototype.start = function(next)
{
	this.get_user_auth(function(auth)
	{	
		superagent.agent()
			.get(API_ROOT + "/event/" + this.data.event_id + "/open?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth
			})
			.end(function(err, res)
			{
				next(err, Event.convert(res.body));
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
		event = Event.convert_to_api(event);
		
		event.Auth = auth;
		
		superagent.agent()
			.get(API_ROOT + "/client/" + this.data.client_id + "/create?Token=" + this.token + "&format=Json")
			.query(event)
			.end(function(err, res)
			{
				if(err) throw err;

				next(err, Event.convert(res.body));
			}.bind(this));
		
	}.bind(this), 
	function(err)
	{
		next(err);
	});
};

scribblelive.prototype.get_articles = function(next)
{
	this.get_user_auth(function(auth)
	{
		superagent.agent()
			.get(API_ROOT + "/client/" + this.data.client_id + "/articles/list?Token=" + this.token + "&format=Json")
			.query({
				Auth: auth,
				Max: this.data.options.max || 10
			})
			.end(function(err, res)
			{
				var articles = [];
				
				if(res.body && res.body.length)
					articles = res.body.map(function(article)
					{
						return Article.convert(article.Article);
					});
				
				next(err, articles);
			}.bind(this));
	}.bind(this), function(err)
	{
		next(err);
	});
	
};

scribblelive.prototype.post = function(post, next)
{
	this.get_user_auth(function(auth)
	{
		post = Post.convert_to_api(post);
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
					next(err, Post.convert(res.body));
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
		case "articles":
			this.get_articles(next);
			break;
		case "article":
			this.get_article(next);
			break;
		default:
			if(this.data.event_id)
			{
				this.get_event(next);
				break;
			}
			else
			{
				next(new Error("Invalid api usage"));
			}
			break;
	}
};



module.exports = scribblelive;


