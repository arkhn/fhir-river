package monitor

// BatchList returns a list of the current batches
func (ctl BatchController) BatchList() (map[string]string, error) {
	return ctl.rdb.HGetAll("batch").Result()
}
