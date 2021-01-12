package monitor

// BatchResources returns the list of resource ids of a batch
func (ctl BatchController) BatchResources(batchId string) ([]string, error) {
	return ctl.rdb.SMembers("batch:"+batchId+":resources").Result()
}
