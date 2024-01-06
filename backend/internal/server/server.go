package server

import (
	"net/http"
	"time"

	"backend/internal/config"
	"backend/internal/game"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

func Start() {
	r := chi.NewRouter()

	gm := game.NewManager()

	// TODO: custom logger
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	// TODO: timeout for http router
	// r.Use(middleware.Timeout(5 * time.Second))

	r.Post("/game/create", func(w http.ResponseWriter, r *http.Request) {
		body, err := parseJson[struct {
			Username string `json:"username"`
			Mode     string `json:"mode"`
		}](r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		code, err := gm.Create(body.Mode)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = gm.AddPlayer(code, body.Username); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		writeJson(w, struct {
			Code     string `json:"code"`
			Username string `json:"username"`
		}{code, body.Username})
	})

	r.Post("/game/join", func(w http.ResponseWriter, r *http.Request) {
		body, err := parseJson[struct {
			Username string `json:"username"`
			Code     string `json:"code"`
		}](r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = gm.AddPlayer(body.Code, body.Username); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		writeJson(w, struct {
			Code     string `json:"code"`
			Username string `json:"username"`
		}{body.Code, body.Username})
	})

	r.Get("/game/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{})
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer conn.CloseNow()

		var body struct {
			Code     string `json:"code"`
			Username string `json:"username"`
		}
		if err = wsjson.Read(r.Context(), conn, &body); err != nil {
			// TODO: ws error handling
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = gm.ConnectPlayer(body.Code, body.Username, conn); err != nil {
			// TODO: ws error handling
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		l := rate.NewLimiter(rate.Every(100*time.Millisecond), 10)
		for {
			if err = l.Wait(r.Context()); err != nil {
				return
			}

			_, m, err := conn.Read(r.Context())
			if err != nil {
				// TODO: ws error handling
			}

			if err = gm.HandleMessage(m); err != nil {
				// TODO: ws error handling
				return
			}
		}
	})

	err := http.ListenAndServe(":"+config.Env.Port, r)
	if err != nil {
		panic(err)
	}
}
