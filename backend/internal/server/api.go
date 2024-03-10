package server

import (
	"encoding/json"
)

// HTTP types
type (
	ErrorResponse struct {
		Errors map[string]string `json:"errors"`
	}

	CreateRequest struct {
		Username string `json:"username"`
		Mode     string `json:"mode"`
	}
	CreateResponse struct {
		Code string `json:"code"`
	}

	JoinRequest struct {
		Username string `json:"username"`
		Code     string `json:"code"`
	}
	JoinResponse struct{}
)

// Websocket types
type (
	PlayerMessage struct {
		Code    string          `json:"code"`
		Message string          `json:"message"`
		Body    json.RawMessage `json:"body"`
	}
	ServerMessage struct {
		Message string `json:"message"`
		Body    any    `json:"body"`
	}
)
