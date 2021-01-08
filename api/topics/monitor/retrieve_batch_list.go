package monitor

// RetrieveBatchList returns a list of the current batches
func (ctl BatchController) RetrieveBatchList() (map[string]string, error) {
	return ctl.rdb.HGetAll("batch").Result()
}
