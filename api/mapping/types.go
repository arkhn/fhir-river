package mapping

type credentials struct {
	Model    string `json:"model"`
	Host     string `json:"host"`
	Port     string `json:"port"`
	Database string `json:"database"`
	Owner    string `json:"owner"`
	Login    string `json:"login"`
	Password string `json:"password"`
}

type column struct {
	Table  string `json:"table"`
	Column string `json:"column"`
}

type filter struct {
	ID        string `json:"id"`
	SqlColumn column `json:"sqlColumn"`
	Relation  string `json:"relation"`
	Value     string `json:"value"`
}

type attribute struct {
	Path         string        `json:"path"`
	DefinitionId string        `json:"definitionId"`
	InputGroups  []*inputGroup `json:"inputGroups"`
}

type inputGroup struct {
	ID            string       `json:"id"`
	MergingScript string       `json:"mergingScript"`
	Inputs        []*input     `json:"inputs"`
	Conditions    []*condition `json:"conditions"`
}

type input struct {
	SqlValue struct {
		Table  string `json:"table"`
		Column string `json:"column"`
		Joins  []*struct {
			Tables []*column `json:"tables"`
		} `json:"joins"`
	} `json:"sqlValue"`
	Script          string            `json:"script"`
	ConceptMapID    string            `json:"conceptMapId"`
	ConceptMapTitle string            `json:"conceptMapTitle"`
	ConceptMap      map[string]string `json:"conceptMap"`
	StaticValue     string            `json:"staticValue"`
}

type condition struct {
	Action   string `json:"action"`
	SqlValue column `json:"sqlValue"`
	Relation string `json:"relation"`
	Value    string `json:"value"`
}

type resource struct {
	ID               string `json:"id"`
	PrimaryKeyTable  string `json:"primaryKeyTable"`
	PrimaryKeyColumn string `json:"primaryKeyColumn"`
	DefinitionId     string `json:"definitionId"`
	Definition       struct {
		Type       string `json:"type"`
		Kind       string `json:"kind"`
		Derivation string `json:"derivation"`
		Url        string `json:"url"`
	} `json:"definition"`
	Filters    []*filter    `json:"filters"`
	Attributes []*attribute `json:"attributes"`
	Source     struct {
		ID         string      `json:"id"`
		Credential credentials `json:"credential"`
	} `json:"source"`
}
