import React, { useEffect, useState, useRef } from 'react';
import Datalist from './Datalist';
import Filter from './Filter';
import logo from './logo.svg';
import './App.css';

import DigestClient from 'digest-fetch';

const printProperties = ({ description,             // string
    deprecated,                                     // object
    stability,                                      // string
    storage,                                        // string
    'access-constraints': accessConstraints,        // object
    ...rest }, filter) => {

  const restProperties = rest.attributes ? printChildProperties(rest, filter)
        : printAttributeProperties(rest, filter);

  if (restProperties === null) {
    return null;
  }

  return (
    <ul>
      { filter['desc'] && makeLi('Description: ' + description) }
      { (filter['depr'] && deprecated) && printDeprecated(deprecated) }
      { (filter['stab'] && stability) && makeLi('Stability: ' + stability) }
      { (filter['stor'] && storage) && makeLi('Storage: ' + storage) }
      { (filter['acon'] && accessConstraints) && makeLi('Access constraints: ' + JSON.stringify(accessConstraints)) }
      { restProperties }
    </ul>
  );
}

const printChildren = (children, filter) => {
  let items = [];

  for (let [key, value] of Object.entries(children)) {
    for (let [descrKey, descrValue] of Object.entries(value['model-description'])) {
      let properties = printProperties(descrValue, filter);
      if (properties === null) continue;
      items.push(makeLi(`${key}=${descrKey}`, 'child', properties));
    }
  }

  if (!items.length) {
    return null;
  }

  return makeLi('Children: ', 'children', <ul>{ items }</ul>);
}

const printChildProperties = ({ attributes,   // object
    capabilities,                             // array
    children,                                 // object
    notifications,                            // object
    operations,                               // object
    'min-occurs': minOccurs,                  // number
    'max-occurs': maxOccurs,                  // number
    ...rest }, filter) => {

  const list = restList(rest);
  const attrList = printAttributes(attributes, filter);
  const childList = printChildren(children, filter);

  if (attrList === null && childList === null) { // everything is filtered out
    return null;
  }

  return (
    <>
      { (filter['cap'] && capabilities?.length) && printCapabilities(capabilities) }
      { (filter['attrs'] && Object.keys(attributes).length > 0) && attrList }
      { (filter['chlds'] && Object.keys(children).length > 0) && childList }
      { (filter['not'] && notifications) && makeLi('Notifications: ' + notifications) }
      { (filter['ope'] && operations) && makeLi('Operations: ' + operations) }
      { (filter['childminmax'] && (minOccurs || maxOccurs)) && printOccurrence(minOccurs, maxOccurs) }
      { /*list*/ }
    </>
  );
}

const printOccurrence = (minOccurs, maxOccurs) => {
  const min = minOccurs != null ? minOccurs : '?';
  const max = maxOccurs != null ? maxOccurs : '?';
  return makeLi(`Occurrence: ${min}-${max}` );
}

const printAttributes = (attrs, filter) => {
  let items = [];

  for (let attr in attrs) {
    let properties = printProperties(attrs[attr], filter);
    if (properties === null) continue;
    items.push(makeLi(attr, 'attribute', printProperties(attrs[attr], filter)));
  }

  if (!items.length) {
    return null;
  }

  return makeLi('Attributes: ', 'attributes', <ul>{ items }</ul>);
}

const printAttributeProperties = ({ 'access-type': accessType,     // string
    'attribute-group': attributeGroup,                             // string
    'capability-reference': capabilityReference,                   // string
    'expressions-allowed': expressionsAllowed,                     // bool
    nillable,                                                      // bool
    required,                                                      // bool
    'restart-required': restartRequired,                           // bool
    type,                                                          // object
    'value-type': valueType,                                       // string || object
    'default': def,                                                // string
    allowed,                                                       // array
    alternatives,                                                  // array
    requires,                                                      // array
    unit,                                                          // string
    'nil-significant': nilSignificant,                             // bool
    'filesystem-path': filesystemPath,                             // string
    'capability-reference-pattern-elements': capRefEl,             // array
    ...rest }, filter) => {

  const list = restList(rest);
  const modelType = getType(type);

  // todo: all selectable values
  if (!isSelected('ALL', filter['type'], modelType)) {
    return null;
  }

  if (!isSelected('off', filter['exprall']?.toLowerCase(), expressionsAllowed)) {
    return null;
  }

  if (!isSelected('off', filter['restreq']?.toLowerCase(), restartRequired)) {
    return null;
  }

  return (
    <>
      { makeLi('Type: ' + modelType + printConstraints(modelType, rest)) }
      { (filter['unit'] && unit) && makeLi('Unit: ' + unit) }
      { ['OBJECT', 'LIST'].includes(modelType) && printValueType(valueType, filter) }
      { (filter['default'] && def != null) && makeLi('Default: ' + def) }
      { (filter['allow'] && allowed) && makeLi('Allowed: ' + allowed) }
      { (filter['alter'] && alternatives) && makeLi('Alternatives: ' + alternatives) }
      { (filter['req'] && requires) && makeLi('Requires: ' + requires) }
      { (filter['capref'] && capabilityReference) && makeLi('CapabilityReference: ' + capabilityReference) }
      { filter['nill'] && makeLi('Nillable: ' + nillable) }
      { (filter['exprall'] !== 'OFF') && makeLi('Expressions allowed: ' + expressionsAllowed) }
      { (filter['restreq'] !== 'OFF') && makeLi('Restart required: ' + restartRequired) }
      { (filter['acctype'] && accessType) && makeLi('Access Type: ' + accessType) }
      { (filter['attgroup'] && attributeGroup) && makeLi('Attribute Group: ' + attributeGroup) }
      { (filter['nilsig'] && nilSignificant) && makeLi('Nil Significant: ' + nilSignificant) }
      { (filter['fspath'] && filesystemPath) && makeLi('Filesystem Path: ' + filesystemPath) }
      { (filter['caprefel'] && capRefEl) && makeLi('Capability Reference Pattern Elements: ' + capRefEl) }
      { /*list*/ }
    </>
  );
}

const printCapabilities = (capsArray) => {
  let items = [];
  capsArray.forEach(cap => items.push(printCapability(cap)));

  return makeLi('Capabilities: ', 'caps', <ul>{ items }</ul>);
}

const printCapability = ({ name, dynamic, stability }) => {    // bool, string, string
  const list = (
    <ul>
      { makeLi('Dynamic: ' + dynamic) }
      { makeLi('Stability: ' + stability) }
    </ul>
  );

  return makeLi(name, 'capability', list);
}

const makeLi = (text, className, subList) => {
  return (
    <li className={ className }>
      <span>{ text }</span>
      { subList }
    </li>
  );
}

const getType = (type) => type['TYPE_MODEL_VALUE'];

const printConstraints = (type, { min, max,
    'min-length': minLength,
    'max-length': maxLength }) => {

  let minToCheck, maxToCheck;

  switch(type) {
    case 'INT':
    case 'LONG':
      minToCheck = min;
      maxToCheck = max;
      break;
    case 'STRING':
      minToCheck = minLength;
      maxToCheck = maxLength;
      if (minToCheck === 1 && maxToCheck == 2147483647) return ""; // default STRING size, don't show
      break;
    default:
      return "";
  }

  const minValue = minToCheck != null ? minToCheck.toLocaleString() : '?';
  const maxValue = maxToCheck != null ? maxToCheck.toLocaleString() : '?';

  if (minValue === maxValue) {
    if (minValue === '?') return ""; // no constraints
    return `(${minValue})`;
  }

  return ` (${minValue}-${maxValue})`;
}

const printDeprecated = (deprecated) => {
  const list = (
    <ul>
      { makeLi('Since: ' + deprecated.since) }
      { makeLi('Reason: ' + deprecated.reason) }
    </ul>
  );

  return makeLi('Deprecated: ', 'deprecated', list);
}

const printValueType = (valueType, filter) => {
  if (valueType == null) {
    return makeLi('Value Type: NULL'); // why does this occur?
  }
  const type = getType(valueType);
  if (type) {
    return makeLi('Value Type: ' + type);
  }

  return printAttributes(valueType, filter);
}

const restList = ({ min, max,
      'min-length': minLength,
      'max-length': maxLength,
      ...list}) => {
  return <>{ Object.entries(list).map(([key, value]) => <li>{ `§${key}: ${JSON.stringify(value)}` }</li>) }</>;
}

const isSelected = (displayAll, filter, prop) => {
  return filter === displayAll || filter == (prop + ""); // bool conversion
}

const App = () => {
  const defaultFilter = {
    attrs: true,
    chlds: true,
    type: 'ALL',
    exprall: 'OFF',
    restreq: 'OFF'
  }
  const [subs, setSubs] = useState([]);
  const [data, setData] = useState(null);
  const filterHook = useState(defaultFilter);
  const client = new DigestClient(process.env.REACT_APP_USERNAME,process.env.REACT_APP_PASSWORD);

  let target = "subsystem/datasources";
  const url = 'http://localhost:9990/management/';
  const op = '?operation=resource-description&recursive=true';
  const subsOp = '?operation=resource'; // HTTP API doesn't support "children-names" operation

  const inputRef = useRef(null);

  useEffect(() => client.fetch(url + subsOp)
      .then(data => data.json())
      .then(data => {
        let subsystems = [];
        for (let sub in data['subsystem']) {
          subsystems.push(sub);
        }
        setSubs(subsystems);
      })
      .catch(e => console.log(e)),
    [1]);

  const fetchData = () => client.fetch(url + inputRef.current.value + op)
      .then(data => data.json())
      .then(data => {
        console.log(data);
        setData(data);
      })
      .catch(e => console.log(e));

  const model = data ? printProperties(data, filterHook[0]) : null;

  return (
    <div className="App">
      <div className="address">
        <span>{ url }</span><Datalist inputRef={ inputRef } list={ subs } defaultValue={ target }/><span>{ op }</span>
      </div>
      <button onClick={ fetchData }>Fetch</button>
      <Filter filterHook={ filterHook } />
      { model && <div className="output">{ model }</div> }
    </div>
  );
}

export default App;