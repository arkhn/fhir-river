package api

type invalidTokenError struct {
	message    string
	statusCode int
}

func (err *invalidTokenError) Error() string {
	return err.message
}
