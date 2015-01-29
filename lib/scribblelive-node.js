var superagent = require("superagent"),
	Url = require('url'),
	Post = require("./models/post.js"),
	Article = require("./models/article.js"),
	AudienceProfile = require("./models/audience_profile.js"),
	Event = require("./models/event.js");

var API_ROOT = "https://apiv1secure.scribblelive.com/api/rest";
var COUNTER_ROOT = "https://counter.scribblelive.com";

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
	copy.data.request_type = "client";
	copy.data.client_id = client_id;
	return copy;
};

scribblelive.prototype.event = function(event_id)
{
	var copy = this.clone();
	copy.data.request_type = "event";
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

scribblelive.prototype.metrics = function(options)
{
	var copy = this.clone();
	copy.data.request_type = ( copy.data.request_type ? copy.data.request_type + "/" : "" ) + "metrics";
	copy.data.options = Array.prototype.slice.call(arguments) || [];
	return copy;
};

scribblelive.prototype.audience = function(options)
{
	var copy = this.clone();
	copy.data.request_type = "audience";
	copy.data.options = options || {};
	return copy;
}

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

scribblelive.prototype.date = function(start, end)
{	
	var copy = this.clone();
	
	var set_date_range = function(start, end)
	{
		if(!end) end = Date.now();

		if(typeof start == "object" && start.getTime ) start = start.getTime();
		if(typeof end == "object" && end.getTime ) end = end.getTime();
		if(typeof start == "string" && start.match(/\d+ days/))
		{
			var daysAgo = parseInt(start.match(/(\d+) days/)[1]);

			var oneweekago = new Date();
			oneweekago.setUTCHours(0);
			oneweekago.setUTCMinutes(0);
			oneweekago.setUTCSeconds(0);
			oneweekago.setUTCMilliseconds(0);
			oneweekago -= (daysAgo-1)*24*60*60*1000;

			start = oneweekago;
		}

		this.data.dateRange = { start: start, end: end };
	}.bind(copy);
	
	if(end)
	{
		set_date_range(start, end);
	}
	else if(start)
	{
		var date = start;
		
		// if it's a number
		if(!isNaN(date))
		{
			if(date<32531500800)
			{
				date = new Date(date*1000);
			}
			else
			{
				date = new Date(date);
			}
		}
		else if(typeof date == "string")
		{
			if(date == "today")
			{
				date = new Date();
				date.setUTCHours(0);
				date.setUTCMinutes(0);
				date.setUTCSeconds(0);
				date.setUTCMilliseconds(0);
			}
		}
		
		set_date_range(date.getTime(), date.getTime() + 24*60*60*1000);
	}
	else
	{
		throw new Error("No valid date was passed");
	}
	
	return copy;
};

scribblelive.prototype.hit = function(config, next)
{
	superagent.agent()
		.get(
			COUNTER_ROOT + "/?page=" + this.data.event_id + "&pageview=1" +
			(config.first ? "&first=1" : "") +
			(config.user_id ? "&uid=" + config.user_id : "" ) +
			"&rand=" + Math.round(100000000 * Math.random()) +
			( config.referrer ? "&Source=" + encodeURIComponent( config.referrer ) + "&SourceType=3" : "" ) +
			"&Client=" + this.data.client_id
		)
		.end(function(err, res)
		{
			if(err)
			{
				next(err);
			}
			else if(res.statusCode == 200)
			{
				next(null, true);
			}
			else
			{
				next(new Error("Call to counter server returned status code: " + res.statusCode));
			}
		});
};


scribblelive.prototype.get_client_metrics = function(next)
{
	var metrics = this.data.options;
	if(metrics.length === 0)
	{
		metrics = ["engagementminutes", "pageviews", "uniques"];
	}
	
	this.get_user_auth(function(user_auth)
	{
		superagent.agent()
			.get(API_ROOT + "/metrics/sherlock/client/" + this.data.client_id + "/overviewbyday/?Format=json&StartDate=" + this.data.dateRange.start + "&EndDate=" + this.data.dateRange.end + "&Token=" + this.token + "&Auth=" + user_auth)
			.end(function(err, res)
			{
				if(err)
				{
					next(err);
					return;
				}
				
				var results = [];
				
				if( res.body.Range && res.body.Range.length > 0 )
				{
					for(var i = 0; i < res.body.Range.length; i++ )
					{
						var date = parseInt(res.body.Range[i].match(/[1-9][0-9]+/));
						var day = {	date: date };
						
						res.body.Series.forEach(function(series)
						{
							switch(series.Descriptor)
							{
								case "PageViews":
									day.pageviews = series.Data[i];
									break;
								case "Uniques":
									day.uniques = series.Data[i];
									break;
								case "EngagementMinutes":
									day.engagementminutes = series.Data[i];
									break;
								
							}
						});
						
						results.push(day);
					}
				}
				
				results.map(function(result)
				{
					var filtered = {};
					
					Object.keys(day).forEach(function(key)
					{
						if(key != "date")
						{
							if(metrics.indexOf(key) < 0)
							{
								delete day[key];
							}
						}
					});
					
				});
				
				next(null, results);
			}.bind(this));
	}.bind(this),
	function(err)
	{
		next(err);
	});
};

scribblelive.prototype.get_audience = function(next)
{
	this.get_user_auth(function(user_auth)
	{
		var filter = {
			FilteredOptions: '',
			SortBy: "",
			StartDate: this.data.dateRange.start,
			EndDate: this.data.dateRange.end
		};
		
		if(this.data.options.email === 1)
		{
			filter.Segment = '{"match":"ALL","filters":[{"option":{"type":"Email"},"comparator":"IS"}]}';
		}
		
		superagent.agent()
			.post("https://client.scribblelive.com/api/rest/sherlock/filter/client/" + this.data.client_id + "/audience/segments/0/?Format=json&SortOrder=DESC&PageLimit=25&Token=" + this.token + "&Auth=" + user_auth)
			.type('form')
			.send(filter)
			.end(function(err, res)
			{
				if(err)
				{
					next(err);
					return;
				}
				else if(res.body.Code)
				{
					next(res.body);
					return;
				}
				
				var profiles = [];
				
				if(res.body.Result && res.body.Result.length > 0 )
				{
					res.body.Result.forEach(function(result)
					{
						profiles.push(AudienceProfile.convert(result.Audience));
					});
				}
				
				
				
				next(null, profiles);
			});
	}.bind(this));
};

scribblelive.prototype.get_event_metrics = function(next)
{
	var metrics = this.data.options;
	if(metrics.length === 0)
	{
		metrics = ["engagementminutes", "pageviews", "uniques"];
	}
	
	var get_metric = function(metric, next)
	{
		if(this.data.event_id)
		{
			if(!this.data.dateRange)
			{
				superagent.agent()
					.get(API_ROOT + "/metrics/" + this.data.event_id + "/" + metric + "/total?Token=" + this.token + "&format=Json")
					.end(function(err, res)
					{
						if(err) throw err;

						next(null, res.body[this.data.event_id]);
					}.bind(this));
			}
			else
			{
				var endDateDiff = ( this.data.dateRange.end - this.data.dateRange.start ) / (24*60*60*1000);
				var endDateDescriptor = Math.ceil(endDateDiff) + "d";

				superagent.agent()
					.get(API_ROOT + "/metrics/" + this.data.event_id + "/" + metric + "/" + this.data.dateRange.start/1000 + "/" + endDateDescriptor + "?Token=" + this.token + "&format=Json")
					.end(function(err, res)
					{
						if(err) throw err;

						var results = [];
						if(res.body && res.body.length > 0)
						{
							res.body.forEach(function(day)
							{
								var result = { date: day.Time * 1000 };
								result[metric] = day.Count;
								results.push(result);
							});
						}
						next(null, results);
					}.bind(this));
			}
		}
		else
		{
			next(new Error("No event id was passed"));
		}
		
	}.bind(this);
	
	var metrics_found = 0;
	var results = {};
	var errs = [];
	metrics.forEach(function(metric)
	{
		get_metric(metric, function(err, result)
		{
			if(err) errs.push(err);
			results[metric] = result;
			metrics_found++;
		});
	});
	
	var check = setInterval(function()
	{
		if(metrics_found >= metrics.length)
		{
			next((errs.length > 0 ? errs : null), results);
			clearInterval(check);
		}
	}.bind(this), 10);
	
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
		case "client/metrics":
			this.get_client_metrics(next);
			break;
		case "event/metrics":
			this.get_event_metrics(next);
			break;
		case "audience":
			this.get_audience(next);
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


