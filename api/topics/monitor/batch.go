package monitor

import "time"

// BatchSet records a batch in Redis
func (ctl BatchController) BatchSet(batchID string) error {
	return ctl.rdb.HSet("batch", batchID, time.Now().Format(time.RFC3339)).Err()
}

// BatchList returns a list of the current batches
func (ctl BatchController) BatchList() (map[string]string, error) {
	return ctl.rdb.HGetAll("batch").Result()
}
