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
	htp := chi.NewRouter()
	wsr := chi.NewRouter()
	r.Mount("", htp)
	r.Mount("", wsr)

	gm := game.NewManager()

	// TODO: custom logger
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	htp.Use(middleware.Timeout(5 * time.Second))

	htp.Post("/game/create", func(w http.ResponseWriter, r *http.Request) {
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

	htp.Post("/game/join", func(w http.ResponseWriter, r *http.Request) {
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

	wsr.Get("/game/ws", func(w http.ResponseWriter, r *http.Request) {
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
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = gm.ConnectPlayer(body.Code, body.Username, conn); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		l := rate.NewLimiter(rate.Every(100*time.Millisecond), 10)
		for {
			if err = l.Wait(r.Context()); err != nil {
				return
			}
		}
	})

	err := http.ListenAndServe(":"+config.Env.Port, r)
	if err != nil {
		panic(err)
	}
}
