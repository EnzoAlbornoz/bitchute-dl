export declare type EVideoLengths = "any" | "short" | "medium" | "long" | "feature";
export declare type EVideoSortings = "relevance" | "newest" | "oldest";
export declare interface IVideoSearchResult {
	success: Boolean;
	url: String;
	count: Number;
	total: Number;
	duration: Number;
	results: Array<IVideoInfo>;
}
export declare interface IVideoInfo {
	kind: "video",
	id: String;
	name: String;
	description: String;
	published: String;
	sensitivity: String;
	views: Number;
	duration: String;
	path: String;
	// images:
	channel_name: String;
	channel_path: String;
}
