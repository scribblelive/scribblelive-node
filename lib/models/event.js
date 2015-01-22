function event(json_from_api)
{
	if(json_from_api.Id)
	{
		this.id = json_from_api.Id;
		this.title = json_from_api.Title;
		this.description = (json_from_api.Description ? json_from_api.Description : null );
		this.creator = {
			name: json_from_api.CreatorName
		};
		this.is = {
			live: ( json_from_api.IsLive === 1 ),
			hidden: ( json_from_api.IsHidden === 1 ),
			deleted: ( json_from_api.IsDeleted === 1 ),
			commenting: ( json_from_api.IsCommenting === 1 ),
			moderated: ( json_from_api.IsModerated === 1 ),
			syndicated: ( json_from_api.IsSyncated === 1 ),
			syndicatable: ( json_from_api.IsSyndicatable === 1 ),
			discussion: ( json_from_api.Discussion.Enabled === 1 ? { moderated: (json_from_api.Discussion.Moderated === 1) } : false )
		};
		this.date = {
			start: event.convert_date(json_from_api.Start),
			end: event.convert_date(json_from_api.End),
			created: event.convert_date(json_from_api.Created),
			modified: event.convert_date(json_from_api.LastModified)
		};
		this.count = {
			posts: json_from_api.NumPosts,
			comments: json_from_api.NumComments,
			syndicated_comments: json_from_api.SyndicatedComments
		};
		this.language = json_from_api.Language;
		
		if(json_from_api.Location)
		this.location = {
			lat: json_from_api.Location.Lat,
			long: json_from_api.Location.Long
		}
	}
}

event.convert_date = function(api_date)
{
	return new Date(parseInt(api_date.match(/\d+/)[0]));
};

event.convert = function(json)
{
	if(typeof json == "object" && json.length)
	{
		// it's an array
		return json.map(function(p)
		{
			return new event(p);
		});
	}
	else if(typeof json == "object")
	{
		// it's an individual post
		return new event(json);
	}
	else
	{
		return null;
	}
};

event.convert_to_api = function(json)
{
	if(json.title)
	{
		return {
			Title: json.title
		};
	}
	else if(json.Title)
	{
		return json;
	}
	else
	{
		throw new Error("Invalid format");
	}
	
};

module.exports = event;