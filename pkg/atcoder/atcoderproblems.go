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
	ContestID string `json:"contestId"`
	Title     string `json:"title"`
}

type atcoderProblemsProblemRes struct {
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
		return nil, fmt.Errorf("failed to get resProblems, status: %d, body: %s",res.StatusCode, bodyBytes)
	}
	var resProblems []*atcoderProblemsProblemRes
	if err := json.NewDecoder(res.Body).Decode(&resProblems); err != nil {
		return nil, err
	}
	problems := make([]*Problem, 0, len(resProblems))
	for _, p := range resProblems {
		problems = append(problems, &Problem{
			ID:        p.ID,
			ContestID: p.ContestID,
			Title:     p.Title,
		})
	}
	return problems, nil
}
