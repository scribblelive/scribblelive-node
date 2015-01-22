function post(json_from_api)
{
	if(json_from_api.Id)
	{
		this.id = json_from_api.Id;
		this.content = json_from_api.Content;
		this.creator = {
			id: json_from_api.Creator.Id,
			name: json_from_api.Creator.Name,
			avatar: json_from_api.Creator.Avatar
		};
		this.is = {
			comment: ( json_from_api.IsComment === 1 ),
			deleted: ( json_from_api.IsDeleted === 1 ),
			stuck: ( json_from_api.IsStuck === 1 ),
			approved: ( json_from_api.IsApproved === 1 ),
		},
		this.source = json_from_api.Source;
		this.type = json_from_api.Type;
		this.date = {
			created: post.convert_date(json_from_api.Created),
			modified: post.convert_date(json_from_api.LastModified)
		};
	}
}

post.convert_date = function(api_date)
{
	return new Date(parseInt(api_date.match(/\d+/)[0]));
};

post.convert = function(json)
{
	if(typeof json == "object" && json.length)
	{
		// it's an array
		return json.map(function(p)
		{
			return new post(p);
		});
	}
	else if(typeof json == "object")
	{
		// it's an individual post
		return new post(json);
	}
	else
	{
		return null;
	}
};

post.convert_to_api = function(json)
{
	if(json.content)
	{
		return {
			Content: json.content,
			Creator: (json.creator ? json.creator.name : undefined )
		};
	}
	else if(json.Content)
	{
		return json;
	}
	else
	{
		throw new Error("Invalid format");
	}
	
};

module.exports = post;