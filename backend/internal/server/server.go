package server

import (
	"encoding/json"
	"net/http"

	"backend/internal/config"
	"backend/internal/game"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/olahol/melody"
)

var M *melody.Melody

type SocketResponse struct {
	Message string `json:"message"`
	Body    string `json:"body"`
}

func Start() {
	r := chi.NewRouter()
	M = melody.New()
	gm := game.NewManager()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Post("/game/create", func(w http.ResponseWriter, r *http.Request) {
		var b struct {
			Username string `json:"username"`
			Mode     string `json:"mode"`
		}
		err := json.NewDecoder(r.Body).Decode(&b)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		switch b.Mode {
		case "classic":
			gm.CreateClassic()
		case "duet":
			gm.CreateDuet()
		}

	})

	r.Post("/game/join", func(w http.ResponseWriter, r *http.Request) {
		var b struct {
			Username string `json:"username"`
			Code     string `json:"code"`
		}
		err := json.NewDecoder(r.Body).Decode(&b)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		p := gm.AddPlayer(b.Code, b.Username)

		err = M.HandleRequestWithKeys(w, r, map[string]interface{}{
			"username": b.Username,
			"code":     b.Code,
			"player":   p,
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return

		}

	})

	M.HandleMessage(func(s *melody.Session, msg []byte) {
		s.Get("player").Session = s
	})

	err := http.ListenAndServe(":"+config.Env.Port, r)
	if err != nil {
		panic(err)
	}
}
