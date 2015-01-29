function profile(json_from_api)
{
	if(json_from_api.Id)
	{
		this.id = json_from_api.Id;
		this.name = json_from_api.Name;
		this.email = json_from_api.Email;
		this.date = {
			created: profile.convert_date(json_from_api.CreatedDate),
			last_modified: profile.convert_date(json_from_api.LastModifiedDate),
			became: {
				active_audience: profile.convert_date(json_from_api.BecameActiveAudienceDate),
				prospect: profile.convert_date(json_from_api.BecameProspectDate),
			}
		};
		this.age = ( json_from_api.Age > 0 ? json_from_api.Age : undefined );
		this.gender = ( json_from_api.Gender == "Unknown" ? undefined : json_from_api.Gender );
		this.avatar = ( json_from_api.AvatarUrl ? { url:json_from_api.AvatarUrl } : undefined );
		this.type = json_from_api.Type;
		this.interaction = {
			totals: json_from_api.InteractionTotals,
			became: {
				active_audience: {
					event: json_from_api.BecameActiveAudienceOnEventId
				},
				prospect: {
					event: json_from_api.BecameProspectOnEventId
				}
			}
		};
	}
}

profile.convert_date = function(api_date)
{
	return new Date(parseInt(api_date.match(/\d+/)[0]));
};

profile.convert = function(json)
{
	if(typeof json == "object" && json.length)
	{
		// it's an array
		return json.map(function(p)
		{
			return new profile(p);
		});
	}
	else if(typeof json == "object")
	{
		// it's an individual post
		return new profile(json);
	}
	else
	{
		return null;
	}
};

module.exports = profile;