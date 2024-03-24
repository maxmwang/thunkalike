package server

import (
	"context"
	"encoding/json"

	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

// HTTP types
type (
	errorResponse struct {
		Errors reqErrors `json:"errors"`
	}

	createRequest struct {
		Username string `json:"username"`
		Mode     string `json:"mode"`
	}
	createResponse struct {
		Code string `json:"code"`
	}

	joinRequest struct {
		Username string `json:"username"`
		Code     string `json:"code"`
	}
	joinResponse struct{}
)

type validator interface {
	validate() reqErrors
}
type reqErrors map[string]string

func (r createRequest) validate() reqErrors {
	errs := reqErrors{}
	if r.Username == "" {
		errs["username"] = "username is required"
	}
	if r.Mode == "" {
		errs["mode"] = "mode is required"
	}
	if r.Mode != "classic" && r.Mode != "duet" {
		errs["mode"] = "mode must be 'classic' or 'duet'"
	}
	return errs
}

func (r joinRequest) validate() reqErrors {
	errs := reqErrors{}
	if r.Username == "" {
		errs["username"] = "username is required"
	}
	if r.Code == "" {
		errs["code"] = "code is required"
	}
	return errs
}

// Websocket types
type (
	// initial joinMessage does not follow the playerMessage struct
	joinMessage struct {
		Username string `json:"username"`
		Code     string `json:"code"`
	}
	playerMessage struct {
		Code    string          `json:"code"`
		Message string          `json:"message"`
		Body    json.RawMessage `json:"body"`
	}
	serverMessage struct {
		Message string `json:"message"`
		Body    any    `json:"body"`
	}
)

type conn websocket.Conn

// SendJson constructs a serverMessage with the given message and body,
// then uses wsjson.Write to write the message to the websocket connection.
func (c *conn) SendJson(message string, body any) error {
	m := serverMessage{message, body}

	return wsjson.Write(context.Background(), (*websocket.Conn)(c), m)
}
