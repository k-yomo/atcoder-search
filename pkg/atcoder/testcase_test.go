package atcoder

import (
	"bytes"
	"context"
	"errors"
	"github.com/dropbox/dropbox-sdk-go-unofficial/v6/dropbox"
	"github.com/dropbox/dropbox-sdk-go-unofficial/v6/dropbox/files"
	"github.com/dropbox/dropbox-sdk-go-unofficial/v6/dropbox/sharing"
	"github.com/google/go-cmp/cmp"
	"go.uber.org/zap"
	"io"
	"io/ioutil"
	"testing"
)

type mockDropboxFilesClient struct {
	files.Client
	ListFolderFunc         func(arg *files.ListFolderArg) (res *files.ListFolderResult, err error)
	ListFolderContinueFunc func(arg *files.ListFolderContinueArg) (res *files.ListFolderResult, err error)
}

func (m *mockDropboxFilesClient) ListFolder(arg *files.ListFolderArg) (res *files.ListFolderResult, err error) {
	return m.ListFolderFunc(arg)
}

func (m *mockDropboxFilesClient) ListFolderContinue(arg *files.ListFolderContinueArg) (res *files.ListFolderResult, err error) {
	return m.ListFolderContinueFunc(arg)
}

type mockDropboxSharingClient struct {
	sharing.Client
	GetSharedLinkFileFunc func(arg *sharing.GetSharedLinkMetadataArg) (res sharing.IsSharedLinkMetadata, content io.ReadCloser, err error)
}

func (m *mockDropboxSharingClient) GetSharedLinkFile(arg *sharing.GetSharedLinkMetadataArg) (res sharing.IsSharedLinkMetadata, content io.ReadCloser, err error) {
	return m.GetSharedLinkFileFunc(arg)
}

func TestTestCaseClient_DownloadTestCases(t *testing.T) {
	type fields struct {
		dropboxFilesTestCaseClient   files.Client
		dropboxSharingTestCaseClient sharing.Client
		logger                       *zap.Logger
	}
	type args struct {
		ctx    context.Context
		params *DownloadTestCasesParams
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    []*TestCase
		wantErr bool
	}{
		{
			name: "successful response",
			fields: fields{
				dropboxFilesTestCaseClient: &mockDropboxFilesClient{
					ListFolderFunc: func(arg *files.ListFolderArg) (res *files.ListFolderResult, err error) {
						// root directory
						if arg.Path == "" {
							return &files.ListFolderResult{
								Entries: []files.IsMetadata{
									&files.FolderMetadata{
										Metadata: files.Metadata{Name: "ABC100"},
									},
								},
								HasMore: false,
							}, nil
						} else if arg.Path == "/ABC100" {
							return &files.ListFolderResult{
								Entries: []files.IsMetadata{
									&files.FolderMetadata{Metadata: files.Metadata{Name: "A"}},
									&files.FolderMetadata{Metadata: files.Metadata{Name: "B"}},
								},
								HasMore: false,
							}, nil
						} else if arg.Path == "/ABC100/A/in" || arg.Path == "/ABC100/A/out" {
							return &files.ListFolderResult{
								Entries: []files.IsMetadata{
									&files.FileMetadata{Metadata: files.Metadata{Name: "001.txt"}},
								},
								HasMore: true,
							}, nil
						} else if arg.Path == "/ABC100/B/in" || arg.Path == "/ABC100/B/out" {
							return &files.ListFolderResult{
								Entries: []files.IsMetadata{
									&files.FileMetadata{Metadata: files.Metadata{Name: "003.txt"}},
								},
								HasMore: false,
							}, nil
						} else {
							return nil, errors.New("unexpected path")
						}
					},
					ListFolderContinueFunc: func(arg *files.ListFolderContinueArg) (res *files.ListFolderResult, err error) {
						return &files.ListFolderResult{
							Entries: []files.IsMetadata{
								&files.FileMetadata{Metadata: files.Metadata{Name: "002.txt"}},
							},
							HasMore: false,
						}, nil
					},
				},
				dropboxSharingTestCaseClient: &mockDropboxSharingClient{
					GetSharedLinkFileFunc: func(arg *sharing.GetSharedLinkMetadataArg) (res sharing.IsSharedLinkMetadata, content io.ReadCloser, err error) {
						return nil, ioutil.NopCloser(bytes.NewBuffer([]byte("1 2 3"))), nil
					},
				},
				logger: nil,
			},
			args: args{ctx: context.Background()},
			want:
			[]*TestCase{
				{
					ContestID:         "abc100",
					ProblemID:         "abc100_a",
					ContestFolderName: "ABC100",
					FileName:          "001.txt",
					In:                "1 2 3",
					Out:               "1 2 3",
				},
				{
					ContestID:         "abc100",
					ProblemID:         "abc100_a",
					ContestFolderName: "ABC100",
					FileName:          "002.txt",
					In:                "1 2 3",
					Out:               "1 2 3",
				},
				{
					ContestID:         "abc100",
					ProblemID:         "abc100_b",
					ContestFolderName: "ABC100",
					FileName:          "003.txt",
					In:                "1 2 3",
					Out:               "1 2 3",
				},
			},
		},
		{

			name: "problems not found",
			fields: fields{
				dropboxFilesTestCaseClient: &mockDropboxFilesClient{
					ListFolderFunc: func(arg *files.ListFolderArg) (res *files.ListFolderResult, err error) {
						// root directory
						if arg.Path == "" {
							return &files.ListFolderResult{
								Entries: []files.IsMetadata{
									&files.FolderMetadata{Metadata: files.Metadata{Name: "ABC100"}},
								},
							}, nil
						} else if arg.Path == "/ABC100" {
							return &files.ListFolderResult{
								Entries: []files.IsMetadata{
									&files.FolderMetadata{Metadata: files.Metadata{Name: "Empty"}},
								},
							}, nil
						} else if arg.Path == "/ABC100/Empty/in" || arg.Path == "/ABC100/Empty/out" {
							return nil, files.ListFolderAPIError{
								EndpointError: &files.ListFolderError{Tagged: dropbox.Tagged{
									Tag: files.ListFolderErrorPath,
								}},
							}
						} else {
							return nil, errors.New("unexpected path")
						}
					},
				},
				dropboxSharingTestCaseClient: &mockDropboxSharingClient{},
			},
			args: args{ctx: context.Background()},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			c := &TestCaseClient{
				dropboxFilesTestCaseClient:   tt.fields.dropboxFilesTestCaseClient,
				dropboxSharingTestCaseClient: tt.fields.dropboxSharingTestCaseClient,
				logger:                       tt.fields.logger,
			}
			got, err := c.DownloadTestCases(tt.args.ctx, tt.args.params)
			if (err != nil) != tt.wantErr {
				t.Errorf("DownloadTestCases() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if diff := cmp.Diff(got, tt.want); diff != "" {
				t.Errorf("DownloadTestCases() (-want +got):\n%s", diff)
			}
		})
	}
}
