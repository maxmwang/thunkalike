package server

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func decodeJson[T validator](r *http.Request) (b T, reqErr reqErrors, decodeErr error) {
	if decodeErr = json.NewDecoder(r.Body).Decode(&b); decodeErr != nil {
		// TODO: log decode errors
		return b, reqErr, fmt.Errorf("decode json: %w", decodeErr)
	}

	if reqErr = b.validate(); len(reqErr) > 0 {
		return b, reqErr, nil
	}

	return b, nil, nil
}

func encodeJson(w http.ResponseWriter, data any, status int) (err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err = json.NewEncoder(w).Encode(data); err != nil {
		// TODO: log encode errors
		return fmt.Errorf("encode json: %w", err)
	}
	return nil
}
