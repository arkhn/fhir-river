package monitor

// BatchSet records a batch in Redis
func (ctl BatchController) BatchSet(batchID string, timestamp string) error {
	return ctl.rdb.HSet("batch", batchID, timestamp).Err()
}

// BatchList returns a list of the current batches
func (ctl BatchController) BatchList() (map[string]string, error) {
	return ctl.rdb.HGetAll("batch").Result()
}
