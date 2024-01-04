package server

import (
	"encoding/json"
	"io"
	"net/http"
)

func parseJson[T any](r *http.Request) (b T, err error) {
	raw, err := io.ReadAll(r.Body)
	if err != nil {
		return
	}

	err = json.Unmarshal(raw, &b)

	return b, nil
}

func writeJson(w http.ResponseWriter, data any) {
	res, err := json.Marshal(data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err = w.Write(res); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
