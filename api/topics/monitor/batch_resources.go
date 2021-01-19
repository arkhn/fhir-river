package monitor

// BatchResourcesSet records the resource ids of a batch in Redis
func (ctl BatchController) BatchResourcesSet(batchID string, resourceIDs []string) error {
	return ctl.rdb.SAdd("batch:"+batchID+":resources", resourceIDs).Err()
}

// BatchResourcesList returns the list of resource ids of a batch
func (ctl BatchController) BatchResourcesList(batchID string) ([]string, error) {
	return ctl.rdb.SMembers("batch:"+batchID+":resources").Result()
}
