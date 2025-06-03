import React, { useState, useRef } from 'react';
import Datalist from './Datalist';
import logo from './logo.svg';
import './App.css';

import DigestClient from 'digest-fetch';

const printChildren = (children) => {
  let items = [];

  for (let [key, value] of Object.entries(children)) {
    for (let [descrKey, descrValue] of Object.entries(value['model-description'])) {
      items.push(makeLi(`${key}=${descrKey}`, 'child',
        printChildDescription(descrValue)));
    }
  }

  return makeLi('Children: ', 'children', <ul>{ items }</ul>);
}

/**
Child-desc:
    - attributes (object of attrs)
    - capabilities (array of caps)
    - children (object of chlds)
    - description: string
    - notifications: ?
    - operations: ?
    - stability: string
*/
const printChildDescription = ({ attributes,
    capabilities,
    children,
    description,
    notifications,
    operations,
    deprecated,
    stability,
    storage,
    'access-constraints': accessContraints,
    'min-occurs': minOccurs,
    'max-occurs': maxOccurs,
    ...rest }) => {

  const list = restList(rest);

  return (
    <ul>
      { makeLi('Description: ' + description) }
      { capabilities?.length && printCapabilities(capabilities) }
      { Object.keys(attributes).length > 0 && printAttributes(attributes) }
      { Object.keys(children).length > 0 && printChildren(children) }
      { storage && makeLi('Storage: ' + storage) }
      { notifications && makeLi('Notifications: ' + notifications) }
      { operations && makeLi('Operations: ' + operations) }
      { deprecated && printDeprecated(deprecated) }
      { stability && makeLi('Stability: ' + stability) }
      { accessContraints && makeLi('Access constraints: ' + JSON.stringify(accessContraints)) }
      { minOccurs && makeLi('Min occurs: ' + minOccurs) }
      { maxOccurs && makeLi('Max occurs: ' + maxOccurs) }
      { /*list*/ }
    </ul>
  );
}

const printAttributes = (attrs) => {
  let list = [];

  for (let attr in attrs) {
    list.push(makeLi(attr, 'attribute', printAttr(attrs[attr])));
  }

  return makeLi('Attributes: ', 'attributes', <ul>{ list }</ul>);
}

/**
Attr:
    - access-type: string
    - attribute-group: string
    - capability-reference: string
    - description: string
    - expressions-allowed: bool
    - max-length, min-length: number
    - nillable, required: bool
    - restart-required: string
    - stability: string
    - storage: string
    - type: object with TYPE_MODEL_VALUE: string
*/
const printAttr = ({ 'access-type': accessType,
    'attribute-group': attributeGroup,
    'capability-reference': capabilityReference,
    description,
    'expressions-allowed': expressionsAllowed,
    nillable,
    required,
    'restart-required': restartRequired,
    stability,
    storage,
    type,
    'value-type': valueType,
    'default': def,
    allowed,
    alternatives,
    requires,
    unit,
    deprecated,
    'nil-significant': nilSignifcant,
    'filesystem-path': filesystemPath,
    'access-constraints': accessContraints,
    'capability-reference-pattern-elements': capRef,
    ...rest }) => {

  const list = restList(rest);
  const modelType = getType(type);

  return (
    <ul>
      { makeLi('Description: ' + description) }
      { makeLi('Type: ' + modelType) }
      { constraints(modelType, rest) }
      { unit && makeLi('Unit: ' + unit) }
      { ['OBJECT', 'LIST'].includes(modelType) && printValueType(valueType) }
      { def != null && makeLi('Default: ' + def) }
      { allowed && makeLi('Allowed: ' + allowed) }
      { alternatives && makeLi('Alternatives: ' + alternatives) }
      { requires && makeLi('Requires: ' + requires) }
      { capabilityReference && makeLi('CapabilityReference: ' + capabilityReference) }
      { makeLi('Nillable: ' + nillable) }
      { makeLi('Expressions allowed: ' + expressionsAllowed) }
      { restartRequired && makeLi('Restart required: ' + restartRequired) }
      { storage && makeLi('Storage: ' + storage) }
      { accessType && makeLi('Access Type: ' + accessType) }
      { attributeGroup && makeLi('Attribute Group: ' + attributeGroup) }
      { makeLi('Stability: ' + stability) }
      { deprecated && printDeprecated(deprecated) }
      { accessContraints && makeLi('Access constraints: ' + JSON.stringify(accessContraints)) }
      { nilSignifcant && makeLi('Nil Significant: ' + nilSignifcant) }
      { filesystemPath && makeLi('Filesystem Path: ' + filesystemPath) }
      { capRef && makeLi('Capability Reference Pattern Elements: ' + capRef) }
      { /*list*/ }
    </ul>
  );
}

const printCapabilities = (capsArray) => {
  let items = [];
  capsArray.forEach(cap => items.push(printCapability(cap)));

  return makeLi('Capabilities: ', 'caps', <ul>{ items }</ul>);
}

/**
Cap:
    - dynamic: bool
    - name: string
    - stability: string
*/

const printCapability = ({ name, dynamic, stability }) => {
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

const constraints = (type, { min, max,
    'min-length': minLength,
    'max-length': maxLength}) => {

  let list = null;

  switch(type) {
    case 'INT':
    case 'LONG':
      if (min != null || max != null) {
        list = <>
                 { min != null && makeLi('Min: ' + min.toLocaleString()) }
                 { max != null && makeLi('Max: ' + max.toLocaleString()) }
               </>
      }
      break;
    case 'STRING':
      if (minLength != null || maxLength != null) {
        list = <>
                 { minLength != null && makeLi('Min: ' + minLength.toLocaleString()) }
                 { maxLength != null && makeLi('Max: ' + maxLength.toLocaleString()) }
               </>
      }
  }

  return list;
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

const printValueType = (valueType) => {
  if (valueType == null) {
    return makeLi('Value Type: NULL'); // why does this occur?
  }
  const type = getType(valueType);
  if (type) {
    return makeLi('Value Type: ' + type);
  }

  return printAttributes(valueType);
}

const restList = ({ min, max,
                      'min-length': minLength,
                      'max-length': maxLength,
                      ...list}) => {
  return <>{ Object.entries(list).map(([key, value]) => <li>{ `§${key}: ${JSON.stringify(value)}` }</li>) }</>;
}

const App = () => {
  const [model, setModel] = useState(null);
  const client = new DigestClient(process.env.REACT_APP_USERNAME,process.env.REACT_APP_PASSWORD);

  let target = "subsystem/datasources";
  const url = 'http://localhost:9990/management/';
  const op = '?operation=resource-description&recursive=true';

  const inputRef = useRef(null);

  const fetchData = () => client.fetch(url + inputRef.current.value + op)
      .then(data => data.json())
      .then(data => {
        console.log(data);
        setModel(printChildDescription(data))
      })
      .catch(e => console.log(e));

  return (
    <div className="App">
      <div className="address">
        <span>{ url }</span><Datalist inputRef={ inputRef } defaultValue={ target }/><span>{ op }</span>
      </div>
      <button onClick={ fetchData }>Fetch</button>
      <div className="output">{ model }</div>
    </div>
  );
}

export default App;
