package main

import "testing"
import "github.com/stretchr/testify/assert"

func Test_getInitialPost(t *testing.T) {

	post, err := getInitialPost("https://old.reddit.com/r/HFY/comments/o2dk2q/enemy_mind_epilogue/")
	assert.Equal(t, nil, err, "No error allowed")
	assert.Equal(t, "o2dk2q", post.ID, "The id should be correct")

	// TODO: Add test cases.

}
