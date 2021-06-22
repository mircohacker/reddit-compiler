package main

import (
	"testing"
)
import "github.com/stretchr/testify/assert"

func Test_getInitialPost(t *testing.T) {

	post, err := getInitialPost("https://old.reddit.com/r/HFY/comments/o2dk2q/enemy_mind_epilogue/")
	assert.Equal(t, nil, err, "No error allowed")
	assert.Equal(t, "o2dk2q", post.ID, "The id should be correct")
}

func Test_listPostsOfAuthor(t *testing.T) {
	res, err := listPostsOfAuthor("o0shad0o", "HFY", "Enemy")
	assert.Equal(t, nil, err, "No error allowed")
	assert.Equal(t, 6, len(res), "No error allowed")
	//assert.Equal(t, "o2dk2q", post.ID, "The id should be correct")
}

func Test_handleChaptersCall(t *testing.T) {
	resultDto, err := handleChaptersCall("https://old.reddit.com/r/HFY/comments/o2dk2q/enemy_mind_epilogue/")
	assert.Equal(t, nil, err, "No error allowed")
	assert.Equal(t, "o0shad0o", resultDto.Author, "The author should be passed to dto")
	assert.Equal(t, 6, len(resultDto.Chapters), "The author should be passed to dto")
}

func Test_getPostsFromIds(t *testing.T) {
	resultDto := getPostsFromIds([]string{"t3_o5npxn", "t3_m71tyw"})
	assert.Equal(t, 2, len(resultDto), "A post for each id is necessary")
}
