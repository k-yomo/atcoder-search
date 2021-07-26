package atcoder

import (
	"context"
	"errors"
	"fmt"
	"github.com/dropbox/dropbox-sdk-go-unofficial/v6/dropbox"
	"github.com/dropbox/dropbox-sdk-go-unofficial/v6/dropbox/files"
	"github.com/dropbox/dropbox-sdk-go-unofficial/v6/dropbox/sharing"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
	"io"
	"sort"
	"strings"
)

const dropboxTestCasesURL = "https://www.dropbox.com/sh/nx3tnilzqz7df8a/AAAYlTq2tiEHl5hsESw6-yfLa?dl=0"

// TestCaseClient represents AtCoder testcases client
type TestCaseClient struct {
	dropboxFilesTestCaseClient   files.Client
	dropboxSharingTestCaseClient sharing.Client

	logger *zap.Logger
}

func NewTestCaseClient(dropboxToken string, logger *zap.Logger) *TestCaseClient {
	config := dropbox.Config{
		Token: dropboxToken,
	}
	return &TestCaseClient{
		dropboxFilesTestCaseClient:   files.New(config),
		dropboxSharingTestCaseClient: sharing.New(config),
		logger:                       logger,
	}
}

// TestCase represents AtCoder's problem testcase
type TestCase struct {
	ContestID string
	ProblemID string
	FileName  string
	In        string
	Out       string
}

type DownloadTestCasesParams struct {
	// SkipContestIDs is the list of content id to skip fetching
	SkipContestIDs []string
	// Limit is fetching contest count limit. if limit is 0, it fetches all.
	Limit int
}

func (c *TestCaseClient) DownloadTestCases(ctx context.Context, params *DownloadTestCasesParams) ([]*TestCase, error) {
	if params == nil {
		params = &DownloadTestCasesParams{}
	}
	alreadyDownloadedContestIDMap := make(map[string]bool)
	for _, id := range params.SkipContestIDs {
		alreadyDownloadedContestIDMap[id] = true
	}

	result, err := c.dropboxFilesTestCaseClient.ListFolder(&files.ListFolderArg{
		SharedLink: files.NewSharedLink(dropboxTestCasesURL),
	})
	if err != nil {
		return nil, err
	}

	c.logInfo(fmt.Sprintf("Found %d contests", len(result.Entries)))

	var testCases []*TestCase
	count := 0
	for _, entry := range result.Entries {
		contestFolder := entry.(*files.FolderMetadata)
		contestID := contestFolder.Name
		if alreadyDownloadedContestIDMap[contestID] {
			c.logInfo(fmt.Sprintf("Skkipped contest '%s'", contestID))
			continue
		}

		contestTestCases, err := c.DownloadContestTestCases(ctx, contestID)
		if err != nil {
			return nil, err
		}
		testCases = append(testCases, contestTestCases...)

		c.logInfo(fmt.Sprintf("Finished fetching test cases for '%s'", contestID), zap.Int("testcaseCount", len(testCases)))

		count += 1
		if params.Limit > 0 && count == params.Limit {
			return testCases, nil
		}
	}
	return testCases, err
}

func (c *TestCaseClient) DownloadContestTestCases(ctx context.Context, contestID string) ([]*TestCase, error) {
	result, err := c.dropboxFilesTestCaseClient.ListFolder(&files.ListFolderArg{
		Path:       fmt.Sprintf("/%s", contestID),
		SharedLink: files.NewSharedLink(dropboxTestCasesURL),
	})
	if err != nil {
		return nil, err
	}
	var testCases []*TestCase
	for _, entry := range result.Entries {
		problemFolder := entry.(*files.FolderMetadata)
		problemTestCases, err := c.downloadProblemTestCases(ctx, contestID, problemFolder.Name)
		if err != nil {
			return nil, err
		}
		c.logInfo(fmt.Sprintf("Finished to fetch testcases for '%s'", fmt.Sprintf("%s/%s", contestID, problemFolder.Name)), zap.Int("testcaseCount", len(problemTestCases)))
		testCases = append(testCases, problemTestCases...)
	}
	return testCases, nil
}

func (c *TestCaseClient) downloadProblemTestCases(ctx context.Context, contestID string, problemFolderName string) ([]*TestCase, error) {
	eg, ctx := errgroup.WithContext(ctx)
	var inFiles, outFiles []*TestCaseFile
	eg.Go(func() error {
		var err error
		inFiles, err = c.downloadFiles(fmt.Sprintf("/%s/%s/in", contestID, problemFolderName))
		// sometimes there is no in/out folders in the problem folder
		if isErrorNotFolderFound(err) {
			return nil
		}
		return err
	})
	eg.Go(func() error {
		var err error
		outFiles, err = c.downloadFiles(fmt.Sprintf("/%s/%s/out", contestID, problemFolderName))
		// sometimes there is no in/out folders in the problem folder
		if isErrorNotFolderFound(err) {
			return nil
		}
		return err
	})
	if err := eg.Wait(); err != nil {
		return nil, err
	}

	testCaseMap := make(map[string]*TestCase)
	for _, in := range inFiles {
		testCaseMap[in.FileName] = &TestCase{
			ContestID: contestID,
			ProblemID: buildProblemID(contestID, problemFolderName),
			FileName:  in.FileName,
			In:        in.Content,
		}
	}
	for _, out := range outFiles {
		// in and out filename is same
		if testCase, ok := testCaseMap[out.FileName]; ok {
			testCase.Out = out.Content
		} else {
			c.logInfo(fmt.Sprintf("in file is not found for out '%s'", fmt.Sprintf("%s/%s/%s", contestID, problemFolderName, out.FileName)))
		}
	}

	testCases := make([]*TestCase, 0, len(testCaseMap))
	for _, testCase := range testCaseMap {
		testCases = append(testCases, testCase)
	}
	sort.Slice(testCases, func(i, j int) bool { return testCases[i].FileName < testCases[j].FileName })
	return testCases, nil
}

type TestCaseFile struct {
	FileName string
	Content  string
}

func (c *TestCaseClient) downloadFiles(folderPath string) ([]*TestCaseFile, error) {
	result, err := c.dropboxFilesTestCaseClient.ListFolder(&files.ListFolderArg{
		Path:       folderPath,
		SharedLink: files.NewSharedLink(dropboxTestCasesURL),
	})
	if err != nil {
		return nil, fmt.Errorf("get list %s: %w", folderPath, err)
	}

	entries := result.Entries
	for result.HasMore {
		var err error
		result, err = c.dropboxFilesTestCaseClient.ListFolderContinue(&files.ListFolderContinueArg{Cursor: result.Cursor})
		if err != nil {
			return nil, fmt.Errorf("get list %s: %w", folderPath, err)
		}
		entries = append(entries, result.Entries...)
	}

	testCaseFiles := make([]*TestCaseFile, 0, len(result.Entries))
	for _, entry := range entries {
		switch entry.(type) {
		case *files.FileMetadata:
		default:
			// skip if the entry is not file
			continue
		}
		file := entry.(*files.FileMetadata)
		filePath := fmt.Sprintf("%s/%s", folderPath, file.Name)
		_, content, err := c.dropboxSharingTestCaseClient.GetSharedLinkFile(&sharing.GetSharedLinkMetadataArg{
			Url:  dropboxTestCasesURL,
			Path: filePath,
		})
		if err != nil {
			return nil, fmt.Errorf("download %s: %w", filePath, err)
		}
		contentBytes, err := io.ReadAll(content)
		if err != nil {
			return nil, fmt.Errorf("read content of %s: %w", filePath, err)
		}
		testCaseFiles = append(testCaseFiles, &TestCaseFile{
			FileName: file.Name,
			Content:  string(contentBytes),
		})
	}
	return testCaseFiles, nil
}

func (c *TestCaseClient) logInfo(msg string, fields ...zap.Field) {
	if c.logger != nil {
		c.logger.Info(msg, fields...)
	}
}

func buildProblemID(contestID string, problemFileName string) string {
	return fmt.Sprintf("%s_%s", contestID, strings.ToLower(problemFileName))
}

func isErrorNotFolderFound(err error) bool {
	apiErr, ok := errors.Unwrap(err).(files.ListFolderAPIError)
	return ok && apiErr.EndpointError.Tag == files.ListFolderErrorPath
}

