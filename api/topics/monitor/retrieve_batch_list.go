package monitor

// RetrieveBatchList returns a list of the current batches
func (ctl BatchController) RetrieveBatchList() (map[string]string, error) {
	list, err := ctl.rdb.HGetAll("batch").Result()
	if err != nil {
		return nil, err
	}
	return list, nil
}
