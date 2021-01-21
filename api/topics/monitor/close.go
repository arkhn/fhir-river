package monitor

func (ctl BatchController) Close() {
	ctl.Topics.Kadmin.Close()
	if err := ctl.rdb.Close(); err != nil {
		panic(err)
	}
}
