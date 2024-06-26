package server

import (
	"encoding/json"
)

// HTTP types
type (
	reqErrors     map[string]string
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
)
