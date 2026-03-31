const CheckBox = ({ id, label, filterHook: [filter, updateFilter] }) => {
    return (
      <label>
        <input type="checkbox" name={ id }
            checked={ filter[id] }
            onClick={() => updateFilter({...filter, [id]: !filter[id]})}/>
        { label }
      </label>
    );
}

const Select = ({ id, label, list, filterHook: [filter, updateFilter] }) => {
    return (
      <label>
        <select name={ id } onChange={(e) => updateFilter({...filter, [id]: e.target.value})}>
          { list.map(item => <option>{item}</option>) }
        </select>
        { label }
      </label>
    );
}

const noneAll = ['NONE', 'ALL']

const modelTypes = [
  ...noneAll,
  "BIG_DECIMAL",
  "BIG_INTEGER",
  "BOOLEAN",
  "BYTES",
  "DOUBLE",
  "EXPRESSION",
  "INT",
  "LIST",
  "LONG",
  "OBJECT",
  "PROPERTY",
  "STRING"
];

const boolSelectTypes = [
  ...noneAll,
  "TRUE",
  "FALSE"
]

const storageTypes = [
  ...noneAll,
  'configuration',
  'runtime'
]

const stabilityTypes = [
  ...noneAll,
  'default',
  'community',
  'preview',
  'experimental'
]

const accessTypeTypes = [
  ...noneAll,
  'read-write',
  'metric'
]

const restartTypes = [
  ...noneAll,
  'no-services',
  'resource-services',
  'all-services',
  'jvm'
]

const operationTypes = [
    ...noneAll,
    'non-default'
]

const Filter = (options) => {
    return (
      <div id="filter">
        <form>
          <fieldset id="common">
            <legend>Common</legend>
            <CheckBox id="description" label="Description" { ...options } />
            <CheckBox id="deprecated" label="Deprecated" { ...options } />
            <Select id="stability" label="Stability" list={ stabilityTypes } { ...options } />
            <CheckBox id="access-constraints" label="Acc. Constr." { ...options } />
          </fieldset>
          <fieldset id="filter-attributes">
            <legend><CheckBox id="attr.show" label="Attributes" { ...options } /></legend>
            <CheckBox id="attr.attribute-group" label="Attribute Group" { ...options } />
            <Select id="attr.access-type" label="Access Type" list={ accessTypeTypes } { ...options } />
            <CheckBox id="attr.capability-reference" label="Cap. Ref." { ...options } />
            <Select id="attr.nillable" label="Nillable" list={ boolSelectTypes } { ...options } />
            <CheckBox id="attr.default" label="Default" { ...options } />
            <CheckBox id="attr.allowed" label="Allowed" { ...options } />
            <CheckBox id="attr.alternatives" label="Alternatives" { ...options } />
            <CheckBox id="attr.requires" label="Requires" { ...options } />
            <CheckBox id="attr.unit" label="Unit" { ...options } />
            <CheckBox id="attr.nil-significant" label="Nil Sig." { ...options } />
            <CheckBox id="attr.filesystem-path" label="FS Path" { ...options } />
            <CheckBox id="attr.capability-reference-pattern-elements" label="Cap. Ref. Pat. El." { ...options } />
            <Select id="attr.type" label="Type" list={ modelTypes } { ...options } />
            <Select id="attr.value-type" label="Value Type" list={ modelTypes } { ...options } />
            <Select id="attr.storage" label="Storage" list={ storageTypes } { ...options } />
            <Select id="attr.expressions-allowed" label="Expr. Allowed" list={ boolSelectTypes } { ...options } />
            <Select id="attr.restart-required" label="Restart Required" list={ restartTypes } { ...options } />
          </fieldset>
          <fieldset id="filter-children">
            <legend><CheckBox id="chld.show" label="Children" { ...options } /></legend>
            <CheckBox id="chld.capabilities" label="Capabilities" { ...options } />
            <CheckBox id="chld.notifications" label="Notifications" { ...options } />
            <Select id="chld.operations" label="Operations" list={ operationTypes } { ...options } />
            <CheckBox id="chld.occurence" label="Occurence" { ...options } />
          </fieldset>
        </form>
      </div>
    );
}

export default Filter;