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

		code := gm.Create(body.Mode, body.Username)
		_ = gm.AddPlayer(code, body.Username) // code is valid, so this should not error

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

		if gameErr := gm.AddPlayer(body.Code, body.Username); gameErr != nil {
			reqErr = reqErrors{"code": gameErr.Error()}
			_ = encodeJson(w, errorResponse{reqErr}, http.StatusBadRequest)
			return
		}

		_ = encodeJson(w, joinResponse{}, http.StatusOK)
	})

	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		c, err := websocket.Accept(w, r, &websocket.AcceptOptions{
			OriginPatterns: []string{"127.0.0.1:5173"},
		})
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer c.CloseNow()

		var msg joinMessage
		if err = wsjson.Read(r.Context(), c, &msg); err != nil {
			// TODO: ws error handling
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if err = gm.ConnectPlayer(msg.Code, msg.Username, (*conn)(c)); err != nil {
			// TODO: ws error handling
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		l := rate.NewLimiter(rate.Every(100*time.Millisecond), 10)
		for {
			if err = l.Wait(r.Context()); err != nil {
				return
			}

			var msg playerMessage
			if err = wsjson.Read(r.Context(), c, &msg); err != nil {
				// TODO(ws_err): handle ws error
			}

			if err = gm.HandleMessage((*conn)(c), msg.Code, msg.Message, msg.Body); err != nil {
				// TODO(ws_err): handle ws error
				fmt.Println(err)
				return
			}
		}
	})

	return r
}
