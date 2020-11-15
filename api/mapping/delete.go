package mapping

import "fmt"

func Delete(resourceID string, batchID string) error {
	err := Rdb.Del(fmt.Sprintf("%s:%s", batchID, resourceID))
	if err != nil {
		return err.Err()
	}
	return nil
}
