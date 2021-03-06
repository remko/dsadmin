package dsadmin

import (
	"embed"
	"io/fs"
)

//go:embed public/*
var webAppAssets embed.FS

var WebAppAssets fs.FS

func init() {
	var err error
	WebAppAssets, err = fs.Sub(webAppAssets, "public")
	if err != nil {
		panic(err)
	}
}
