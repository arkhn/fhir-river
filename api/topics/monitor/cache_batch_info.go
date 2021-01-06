package monitor

import "time"

// CacheBatchInfo stores resource ids of current batch in Redis
func (ctl BatchController) CacheBatchInfo(batchID string, resourceIDs []string) error {
	if err := ctl.rdb.HSet("batch", batchID, time.Now().Format(time.RFC3339)).Err(); err != nil {
		return err
	}
	if err := ctl.rdb.SAdd("batch:"+batchID+":resources", resourceIDs).Err(); err != nil {
		return err
	}
	return nil
}
