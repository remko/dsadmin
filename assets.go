package dsadmin

import (
	"embed"
	"io/fs"
)

//go:embed build/*
var webAppAssets embed.FS

var WebAppAssets fs.FS

func init() {
	var err error
	WebAppAssets, err = fs.Sub(webAppAssets, "build")
	if err != nil {
		panic(err)
	}
}
