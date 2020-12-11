package monitor

import (
	"log"
	"time"
)

const counterExpiration = "336h"

// Destroy deletes a batch by removing its Redis keys and Kafka topics.
// The Redis counter is not deleted right away for testing purposes but we set an expiration duration.
func (ctl BatchController) Destroy(batchID string) error {
	if err := ctl.Controller.Delete(batchID); err != nil {
		return err
	}
	twoWeeks, err := time.ParseDuration(counterExpiration)
	if err != nil {
		return err
	}
	if _, err := ctl.rdb.Expire("batch:"+batchID+":counter", twoWeeks).Result(); err != nil {
		return err
	}
	if _, err := ctl.rdb.Del("batch:" + batchID + ":resources").Result(); err != nil {
		return err
	}
	log.Println("batch:" + batchID + " destroyed")
	return nil
}
