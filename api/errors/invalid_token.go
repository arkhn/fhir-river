package errors

type InvalidTokenError struct {
	Message    string
	StatusCode int
}

func (err *InvalidTokenError) Error() string {
	return err.Message
}
