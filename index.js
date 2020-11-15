// Imports
const { default: axios } = require("axios");
const cookieParser = require("set-cookie-parser");
// Define Constants

/** @type {Record<import(".").EVideoLengths, string>} */
const V_DURATIONS = {
	any: "",
	short: "",
	medium: "",
	long: "",
	feature: "",
};

/** @type {Record<import(".").EVideoSortings, string} */
const V_SORTINGS = {
	relevance: "",
	newest: "",
	oldest: "",
};

// Export Functions
/**
 *
 * @param {string} possibleLink
 * @returns {boolean}
 */
function isBitchuteLink(possibleLink) {
	try {
		// Check if is a link
		const link = new URL(possibleLink);
		// Check if is from bitchute domain
		return link.hostname.endsWith(".bitchute.com");
	} catch (err) {
		// Check Invalid URL
		if (err instanceof TypeError && err.code === "ERR_INVALID_URL")
			return false;
		// Error Not Identified -> Throw It
		throw err;
	}
}

async function fetchCookies() {
	// Resquest Home Page of Bitchute
	const response = await axios({
		method: "GET",
		baseURL: "https://www.bitchute.com",
		url: "/",
	});
	/** @type {Array<string>} Fetch Cookie from Response */
	const setCookies = response.headers["set-cookie"];
	// Parse Cookies
	const cookies = cookieParser(setCookies, { map: true });
	// Return Cookies
	return cookies;
}

/**
 *
 * @param {string} topic
 * @param {import(".").EVideoLengths} [duration]
 * @param {import(".").EVideoSortings} [sorting]
 * @param {import("set-cookie-parser").CookieMap | Promise<import("set-cookie-parser").CookieMap>} [cookies]
 */
async function searchVideo(
	topic,
	duration = "any",
	sorting = "relevance",
	cookies = fetchCookies()
) {
	// Fetch Needed Cookies
	const { __cfduid: cfduid, csrftoken: csrf } =
		cookies instanceof Promise ? await cookies : cookies;
	// Make Request on Bitchute API
	/** @type {import("axios").AxiosResponse<import(".").IVideoSearchResult>} */
	const response = await axios({
		method: "POST",
		baseURL: "https://www.bitchute.com",
		url: "/api/search/list/",
		data: new URLSearchParams({
			csrfmiddlewaretoken: csrf.value,
			query: topic,
			kind: "video",
			duration: V_DURATIONS[duration],
			sort: V_SORTINGS[sorting],
			page: 0,
		}).toString(),
		headers: {
			Cookie: ""
				.concat(`${cfduid.name}=${cfduid.value};`)
				.concat(`${csrf.name}=${csrf.value}`),
			Referer: "https://www.bitchute.com/search/?".concat(
				new URLSearchParams({
					query: topic,
					kind: "video",
					duration: V_DURATIONS[duration],
					sort: V_SORTINGS[sorting],
				})
			),
		},
	});
	// Get Content
	const searchResults = response.data;
	// Check if Sucessful Search
	if (!searchResults.success)
		throw new Error(
			"Result data not sucessful\n".concat(JSON.stringify(searchResults))
		);
	// Return Video List
	return searchResults.results;
}

/**
 *
 * @param {string} publicPath
 * @param {import("set-cookie-parser").CookieMap | Promise<import("set-cookie-parser").CookieMap>} [cookies]
 */
async function getVideoPrivateLink(publicPath, cookies = fetchCookies()) {
	// Fetch Needed Cookies
	const { __cfduid: cfduid, csrftoken: csrf } =
		cookies instanceof Promise ? await cookies : cookies;
	// Make Request on Bitchute API
	/** @type {import("axios").AxiosResponse<string>} */
	const response = await axios({
		method: "GET",
		baseURL: "https://www.bitchute.com",
		url: publicPath,
		headers: {
			Cookie: ""
				.concat(`${cfduid.name}=${cfduid.value};`)
				.concat(`${csrf.name}=${csrf.value}`),
			Referer: "https://www.bitchute.com/",
		},
	});
	// Get HTML Content
	const pageContent = response.data;
	// User Regex to Extract Private Link
	const privateLink = new RegExp(
		`<source src="(?<pLink>[a-zA-Z0-9\\-_\\.~:/]+)" type="video/mp4" />`
	).exec(pageContent).groups.pLink;
	// Return Link
	return privateLink;
}

/**
 *
 * @param {string} privateLink
 */
async function getVideoStream(privateLink) {
	// Request Video on BitChute
	const response = await axios({
		method: "GET",
		url: privateLink,
		responseType: "stream",
	});
	// Extract Video Stream
	/** @type {import("stream").Readable} */
	const videoStream = response.data;
	// Return Stream
	return videoStream;
}

// Export Module Functions
module.exports = {
	isBitchuteLink,
	searchVideo,
	getVideoPrivateLink,
	getVideoStream,
};
