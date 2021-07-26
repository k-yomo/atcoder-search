

.PHONY: test
test:
	go test ./... -v -race $(TESTARGS) -coverprofile=coverage.out

.PHONY: test-cover
test-cover: test
	go tool cover -func=coverage.out
	go tool cover -html=coverage.out
