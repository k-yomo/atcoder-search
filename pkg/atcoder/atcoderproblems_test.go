package atcoder

import (
	"bytes"
	"context"
	"github.com/google/go-cmp/cmp"
	"github.com/k-yomo/atcoder-search/pkg/httptestutil"
	"io/ioutil"
	"net/http"
	"testing"
)

func TestAtCoderProblemsClient_GetAllProblems(t *testing.T) {
	type fields struct {
		httpClient *http.Client
	}
	type args struct {
		ctx context.Context
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    []*Problem
		wantErr bool
	}{
		{
			name: "successful response",
			fields: fields{
				httpClient: httptestutil.NewTestClient(t, func(req *http.Request) *http.Response {
					return &http.Response{
						StatusCode: 200,
						Body:       ioutil.NopCloser(bytes.NewBuffer([]byte(`[{"id":"APG4b_a","contest_id":"APG4b","title":"A. 1.00.はじめに"},{"id":"APG4b_bw","contest_id":"APG4b","title":"EX26. 3.06"}]`))),
					}
				}),
			},
			args: args{
				ctx: context.Background(),
			},
			want: []*Problem{
				{ID: "APG4b_a", ContestID: "APG4b", Title: "A. 1.00.はじめに"},
				{ID: "APG4b_bw", ContestID: "APG4b", Title: "EX26. 3.06"},
			},
		},
		{
			name: "server error",
			fields: fields{
				httpClient: httptestutil.NewTestClient(t, func(req *http.Request) *http.Response {
					return &http.Response{
						StatusCode: 500,
						Body:       ioutil.NopCloser(bytes.NewBuffer([]byte(`internal server error`))),
					}
				}),
			},
			args: args{
				ctx: context.Background(),
			},
			wantErr: true,
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			a := NewAtCoderProblemsClient(tt.fields.httpClient)
			got, err := a.GetAllProblems(tt.args.ctx)
			if (err != nil) != tt.wantErr {
				t.Errorf("GetAllProblems() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if diff := cmp.Diff(got, tt.want); diff != "" {
				t.Errorf("GetAllProblems() (-want +got):\n%s", diff)
			}
		})
	}
}
