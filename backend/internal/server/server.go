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
		_ = encodeJson(w, gm, http.StatusOK)
	})

	r.Post("/api/game/create", func(w http.ResponseWriter, r *http.Request) {
		body, reqErr, decodeErr := decodeJson[createRequest](r)
		if decodeErr != nil {
			_ = encodeJson(w, decodeErr.Error(), http.StatusInternalServerError)
			return
		}
		if len(reqErr) > 0 {
			_ = encodeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		code := gm.Create(body.Mode)
		_ = gm.AddPlayer(code, body.Username, true) // code is valid, so this should not error

		_ = encodeJson(w, createResponse{code}, http.StatusOK)
	})

	r.Post("/api/game/join", func(w http.ResponseWriter, r *http.Request) {
		body, reqErr, decodeErr := decodeJson[joinRequest](r)
		if decodeErr != nil {
			_ = encodeJson(w, decodeErr.Error(), http.StatusInternalServerError)
			return
		}
		if len(reqErr) > 0 {
			_ = encodeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		if gameErr := gm.AddPlayer(body.Code, body.Username, false); gameErr != nil {
			reqErr = reqErrors{"code": gameErr.Error()}
			_ = encodeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		_ = encodeJson(w, joinResponse{}, http.StatusOK)
	})

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
			OriginPatterns: []string{"127.0.0.1:5173"},
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer conn.CloseNow()

		var msg joinMessage
		if err = wsjson.Read(r.Context(), conn, &msg); err != nil {
			// TODO: ws error handling
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = gm.ConnectPlayer(msg.Code, msg.Username, conn); err != nil {
			// TODO: ws error handling
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		l := rate.NewLimiter(rate.Every(100*time.Millisecond), 10)
		for {
			if err = l.Wait(r.Context()); err != nil {
				return
			}

			_, msg, err := conn.Read(r.Context())
			if err != nil {
				// TODO: ws error handling
			}

			if err = gm.HandleMessage(msg); err != nil {
				// TODO: ws error handling
				fmt.Println(err)
				return
			}
		}
	})

	return r
}
