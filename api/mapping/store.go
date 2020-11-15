package mapping

import "fmt"

func Store(mapping []byte, resourceID string, batchID string) error {
	err := Rdb.Set(fmt.Sprintf("%s:%s", batchID, resourceID), mapping, 0)
	if err != nil {
		return err.Err()
	}
	return nil
}
