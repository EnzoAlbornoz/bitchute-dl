# Bitchute Downloader

This packages is focused on creating a wrapper over the BitChute site. Because the website doesn't have a API, the majority of the functions use HTML scrapping or XHR requests that are detected when videos are searched or selected.

## API

### `isBitchuteLink(possibleLink) : bool`
Checks if a possible value is a valid URL and it's from bitchute domain

Paramameters:

- `possibleLink: String`: Value containing a possible BitChute URL

### `fetchCookies() : Promise<CookieMap>`
To correctly connecto to BitChute, it's needed to request to contains some cookies. So, this function will fetch these values. You can pass it to other functions to prevent they to fetch cookies internally.

### `searchVideo (topic, duration, sorting,	cookies) : Promise<IVideoInfo[]>`
List Bitchute videos based on search criteria. Currently, only the first page data is fetch.

Parameters:

- `topic: String` - The topic that you want to query
- `duration: String` - Video duration category. Possible values are:
	- `"any"` - Do not restrict
	- `"short"` - Videos between 0 and 5 minutes
	- `"medium"` - Videos between 5 and 20 minutes
	- `"long"` - Videos longer than 20 minutes
	- `"feature"` - Videos longer than 45 minutes
- `sorting: String` - Video sorting setting. Possible values are:
	- `"relevance"` - Use higher relevance sorting (Default)
	- `"newest"` - Sort newest videos first
	- `"oldest"` - Sort oldest videos first
- `cookies: CookieMap` - Cookies fetched from `fetchCookies`

### `getVideoPrivateLink(publicPath, cookies): Promise<String>`
When acessing BitChute video pages, the URL is formed by its domain and a path (e.g `/video/QBoDWtj3e8wi/` is the path part). With this data, we can fetch the private link for the video, i.e, the link for the video file on a content web server.

Parameters:

- `publicPath: String` - The public path of the target video
- `cookies: CookieMap` - Cookies fetched from `fetchCookies`

### `getVideoStream(privateLink) : Promise<Readable>`
With the private link of a video, we can access the file as a binary data, creating a download stream from the remote data.

Parameters:

- `privateLink: String` - The private link of a Bitchute video. (Usually achieved with the `getVideoPrivateLink` function)
