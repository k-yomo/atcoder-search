package atcoder

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type AtCoderProblemsClient struct {
	httpClient *http.Client
}

func NewAtCoderProblemsClient(httpClient *http.Client) *AtCoderProblemsClient {
	return &AtCoderProblemsClient{
		httpClient: httpClient,
	}
}

// Problem represents AtCoder's problem metadata
type Problem struct {
	ID        string `json:"id"`
	ContestID string `json:"contest_id"`
	Title     string `json:"title"`
}

func (a *AtCoderProblemsClient) GetAllProblems(ctx context.Context) ([]*Problem, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://kenkoooo.com/atcoder/resources/problems.json", nil)
	if err != nil {
		return nil, err
	}
	res, err := a.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		bodyBytes, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, err
		}
		return nil, fmt.Errorf("failed to get problems, status: %d, body: %s",res.StatusCode, bodyBytes)
	}
	var problems []*Problem
	if err := json.NewDecoder(res.Body).Decode(&problems); err != nil {
		return nil, err
	}
	return problems, nil
}
