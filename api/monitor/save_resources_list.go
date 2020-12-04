package monitor

// SaveResourcesList stores resource ids of current batch in Redis
func (ctl BatchController) SaveResourcesList(batchID string, resourceIDs []string) error {
	if err := ctl.rdb.SAdd("batch:"+batchID+":resources", resourceIDs).Err(); err != nil {
		return err
	}
	return nil
}
