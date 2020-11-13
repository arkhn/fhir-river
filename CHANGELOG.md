# Changelog

All the changes between different releases of this project should be documented here.

## [0.1.1](https://github.com/arkhn/fhir-river/releases/tag/v0.1.1) - 2020-11-13
---

### Added
- [extractor] Handle "between" filter ([#158](https://github.com/arkhn/fhir-river/pull/158))
- [transformer] Using a non-primary key in the mapping will fill up fhir arrays ([#151](https://github.com/arkhn/fhir-river/pull/151))

### Changed
- [requirements] Use cleaning-scripts package version 0.2.25 ([#171](https://github.com/arkhn/fhir-river/pull/171))
- [transformer] Avoid scientific notation when casting to string ([#167](https://github.com/arkhn/fhir-river/pull/167))
- [extractor] Disable joins on conditions ([#166](https://github.com/arkhn/fhir-river/pull/166))
- [docker] Use a single base docker image for extractor ([#165](https://github.com/arkhn/fhir-river/pull/165))
- [extractor] Refactor joins to be able to join the same table in different ways ([#163](https://github.com/arkhn/fhir-river/pull/163))
- [transformer] Apply cleaning scripts before casting to right type ([#161](https://github.com/arkhn/fhir-river/pull/161))
- [extractor] Use yield_per to chunk query responses ([#156](https://github.com/arkhn/fhir-river/pull/156))
- [analyzer] Return raw data on Attribute.cast_type error ([#154](https://github.com/arkhn/fhir-river/pull/154))
- [extractor] Use = instead of IN in filter query with single values ([#153](https://github.com/arkhn/fhir-river/pull/153))

### Removed
- [tests] Remove integration tests ([#164](https://github.com/arkhn/fhir-river/pull/164))

## [0.1.0](https://github.com/arkhn/fhir-river/releases/tag/v0.1.0) - 2020-10-28
---
First published version