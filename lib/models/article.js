function article(json_from_api)
{
	if(json_from_api.Id)
	{
		this.id = json_from_api.Id;
		this.title = json_from_api.Title;
		this.creator = ( json_from_api.Creator ? {
			id: json_from_api.Creator.Id,
			name: json_from_api.Creator.Name,
			avatar: json_from_api.Creator.Avatar
		} : null ),
		this.date = {
			created: article.convert_date(json_from_api.CreationDate)
		};
		
		if(json_from_api.Html) this.html = json_from_api.Html;
		if(json_from_api.Snippet) this.snippet = json_from_api.Snippet;
		
		this.is = {};
		this.is.draft = (json_from_api.IsDraft === 1 || json_from_api.ArticleStatus == "draft");
		this.is.active = (json_from_api.IsActive === 1 || !json_from_api.IsActive );
		this.is.published = (json_from_api.ArticleStatus == "published" || !this.is.draft );
	}
}

article.convert_date = function(api_date)
{
	return new Date(parseInt(api_date.match(/\d+/)[0]));
};

article.convert = function(json)
{
	if(typeof json == "object" && json.length)
	{
		// it's an array
		return json.map(function(p)
		{
			return new article(p);
		});
	}
	else if(typeof json == "object")
	{
		// it's an individual post
		return new article(json);
	}
	else
	{
		return null;
	}
};

article.convert_to_api = function(json)
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

module.exports = article;