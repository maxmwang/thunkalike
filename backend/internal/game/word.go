package game

import (
	"os"
	"path/filepath"
	"strings"
)

func loadWords(source string) ([]string, error) {
	fp, _ := filepath.Abs("./" + source)
	dat, err := os.ReadFile(fp)
	if err != nil {
		return nil, err
	}

	words := strings.Split(string(dat), "\n")
	return words[:len(words)-1], nil
}
