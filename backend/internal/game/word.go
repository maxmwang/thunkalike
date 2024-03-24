package game

import (
	"encoding/json"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
)

func loadWords(pack string) ([]string, error) {
	fp, _ := filepath.Abs("./" + pack)
	dat, err := os.ReadFile(fp)
	if err != nil {
		return nil, err
	}

	words := strings.Split(string(dat), "\n")
	return words[:len(words)-1], nil
}

type wordManager struct {
	// word is the current word.
	word string

	// words is the list of words to choose from.
	words []string

	// lastUsed is a one-to-one mapping of words to their last used poll.
	lastUsed []int

	// poll is the current poll number.
	poll int
}

// newWordManager creates a new wordManager with the given pack's name. Also
// polls the first word.
func newWordManager(pack string) (wm wordManager, err error) {
	wm.words, err = loadWords(pack)
	if err != nil {
		return wm, err
	}

	wm.lastUsed = make([]int, len(wm.words))
	wm.next()
	return wm, nil
}

func (wm wordManager) next() {
	if wm.poll > len(wm.words) {
		wm.lastUsed = make([]int, len(wm.words))
	}

	for {
		i := rand.Intn(len(wm.words))
		if wm.lastUsed[i] == 0 {
			wm.word = wm.words[i]
			wm.lastUsed[i] = wm.poll
			wm.poll++
			return
		}
	}
}

func (wm wordManager) MarshalJSON() ([]byte, error) {
	return json.Marshal(wm.word)
}

func (wm wordManager) String() string {
	return wm.word
}
