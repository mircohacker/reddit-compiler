package main

import "time"

type SinglePost struct {
	Subreddit             string  `json:"subreddit"`
	SubredditNamePrefixed string  `json:"subreddit_name_prefixed"`
	Name                  string  `json:"name"`
	Title                 string  `json:"title"`
	AuthorFullname        string  `json:"author_fullname"`
	IsSelf                bool    `json:"is_self"`
	CreatedUtc            float64 `json:"created_utc"`
	SelftextHTML          string  `json:"selftext_html"`
	SubredditID           string  `json:"subreddit_id"`
	ID                    string  `json:"id"`
	Author                string  `json:"author"`
	URL                   string  `json:"url"`
}

type RedditResultSinglePost []struct {
	Data struct {
		Children []struct {
			Kind string     `json:"kind"`
			Data SinglePost `json:"data"`
		} `json:"children"`
	} `json:"data"`
}

type RedditResultListing struct {
	Kind string `json:"kind"`
	Data struct {
		After  string `json:"after"`
		Dist   int    `json:"dist"`
		Facets struct {
		} `json:"facets"`
		Modhash  string `json:"modhash"`
		Children []struct {
			Kind string     `json:"kind"`
			Data SinglePost `json:"data,omitempty"`
		} `json:"children"`
	} `json:"data"`
}

type ChaptersDto struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Snippet      string    `json:"snippet"`
	Date         time.Time `json:"date"`
	OriginalLink string    `json:"original_link"`
}
type SearchChaptersResultDto struct {
	Author     string        `json:"author"`
	SearchTerm string        `json:"search_term"`
	Chapters   []ChaptersDto `json:"chapters"`
}
