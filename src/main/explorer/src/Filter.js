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

const modelTypes = [
    "ALL",
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

const Filter = (options) => {

    // TODO: Select for "storage" (only 2 options?)
    // TODO: attributes

    return (
      <div id="filter">
        <form>
          <CheckBox id="desc" label="Description" { ...options } />
          <CheckBox id="depr" label="Deprecated" { ...options } />
          <CheckBox id="stab" label="Stability" { ...options } />
          <CheckBox id="acon" label="Acc. Constr." { ...options } />
          <fieldset id="filter-attributes">
            <legend>Attributes</legend>
            <CheckBox id="acctype" label="Access Type" { ...options } />
            <CheckBox id="attgroup" label="Attribute Group" { ...options } />
            <CheckBox id="capref" label="Cap. Ref." { ...options } />
            <CheckBox id="exprall" label="Expr. Allowed" { ...options } />
            <CheckBox id="nill" label="Nilable" { ...options } />
            <CheckBox id="default" label="Default" { ...options } />
            <CheckBox id="allow" label="Allowed" { ...options } />
            <CheckBox id="alter" label="Alternatives" { ...options } />
            <CheckBox id="req" label="Requires" { ...options } />
            <CheckBox id="unit" label="Unit" { ...options } />
            <CheckBox id="nilsig" label="Nil Sig." { ...options } />
            <CheckBox id="fspath" label="FS Path" { ...options } />
            <CheckBox id="caprefel" label="Cap. Ref. Pat. El." { ...options } />
            <Select id="type" label="Value Type" list={ modelTypes } { ...options } />
            <Select id="restreq" label="Restart Required" list={ [] } { ...options } />
          </fieldset>
          <fieldset id="filter-children">
            <legend>Children</legend>
            <CheckBox id="attrs" label="Attributes" { ...options } />
            <CheckBox id="chlds" label="Children" { ...options } />
            <hr/>
            <CheckBox id="cap" label="Capabilities" { ...options } />
            <CheckBox id="not" label="Notifications" { ...options } />
            <CheckBox id="ope" label="Operations" { ...options } />
            <CheckBox id="childminmax" label="Min/Max Occurs" { ...options } />
          </fieldset>
        </form>
      </div>
    );

    /*
        + max/min
        + expressions allow (YES/NO/OFF)
        'restart-required': restartRequired,                           // bool
        'value-type': valueType,                                       // string || object

        */
}

export default Filter;