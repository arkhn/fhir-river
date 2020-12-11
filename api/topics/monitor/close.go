package monitor

func (ctl BatchController) Close() {
	ctl.Kadmin.Close()
	if err := ctl.rdb.Close(); err != nil {
		panic(err)
	}
}
