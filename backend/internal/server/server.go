package server

import (
	"fmt"
	"net/http"
	"time"

	"backend/internal/game"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"golang.org/x/time/rate"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

func New() http.Handler {
	r := chi.NewRouter()

	gm := game.NewManager()

	// TODO: custom logger
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	// TODO: timeout for http router
	// r.Use(middleware.Timeout(5 * time.Second))

	r.Get("/dev/dump", func(w http.ResponseWriter, r *http.Request) {
		_ = writeJson(w, gm, http.StatusOK)
	})

	r.Post("/api/game/create", func(w http.ResponseWriter, r *http.Request) {
		body, reqErr, decodeErr := readJson[createRequest](r)
		if decodeErr != nil {
			_ = writeJson(w, decodeErr.Error(), http.StatusInternalServerError)
			return
		}
		if len(reqErr) > 0 {
			_ = writeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		code := gm.Create(body.Mode)
		_ = gm.AddPlayer(code, body.Username) // code is valid, so this should not error

		_ = writeJson(w, createResponse{code}, http.StatusOK)
	})

	r.Post("/api/game/join", func(w http.ResponseWriter, r *http.Request) {
		body, reqErr, decodeErr := readJson[joinRequest](r)
		if decodeErr != nil {
			_ = writeJson(w, decodeErr.Error(), http.StatusInternalServerError)
			return
		}
		if len(reqErr) > 0 {
			_ = writeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		if gameErr := gm.AddPlayer(body.Code, body.Username); gameErr != nil {
			reqErr = reqErrors{"code": gameErr.Error()}
			_ = writeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		_ = writeJson(w, joinResponse{}, http.StatusOK)
	})

	r.Get("/api/game/ws", func(w http.ResponseWriter, r *http.Request) {
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

			_, b, err := conn.Read(r.Context())
			if err != nil {
				// TODO: ws error handling
			}

			if err = gm.HandleMessage(b); err != nil {
				// TODO: ws error handling
				fmt.Println(err)
				return
			}
		}
	})

	return r
}
