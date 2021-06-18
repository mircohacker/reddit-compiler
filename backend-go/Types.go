package main

type SinglePost struct {
	Subreddit             string  `json:"subreddit"`
	SubredditNamePrefixed string  `json:"subreddit_name_prefixed"`
	Name                  string  `json:"name"`
	Title                 string  `json:"title"`
	AuthorFullname        string  `json:"author_fullname"`
	IsSelf                bool    `json:"is_self"`
	Created               float64 `json:"created"`
	SelftextHTML          string  `json:"selftext_html"`
	SubredditID           string  `json:"subreddit_id"`
	ID                    string  `json:"id"`
	Author                string  `json:"author"`
	URL                   string  `json:"url"`
}

type RedditResult []struct {
	Data struct {
		Children []struct {
			Kind string     `json:"kind"`
			Data SinglePost `json:"data"`
		} `json:"children"`
	} `json:"data"`
}
