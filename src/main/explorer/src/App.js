import React, { useState, useRef } from 'react';
import Datalist from './Datalist';
import logo from './logo.svg';
import './App.css';

import DigestClient from 'digest-fetch';

const printProperties = ({ description,             // string
    deprecated,                                     // object
    stability,                                      // string
    storage,                                        // string
    'access-constraints': accessConstraints,        // object
    ...rest }) => {

  const printRest = (rest) => {
    return rest.attributes ? printChildProperties(rest) : printAttributeProperties(rest);
  }

  return (
    <ul>
      { makeLi('Description: ' + description) }
      { deprecated && printDeprecated(deprecated) }
      { stability && makeLi('Stability: ' + stability) }
      { storage && makeLi('Storage: ' + storage) }
      { accessConstraints && makeLi('Access constraints: ' + JSON.stringify(accessConstraints)) }
      { printRest(rest) }
    </ul>
  );
}

const printChildren = (children) => {
  let items = [];

  for (let [key, value] of Object.entries(children)) {
    for (let [descrKey, descrValue] of Object.entries(value['model-description'])) {
      items.push(makeLi(`${key}=${descrKey}`, 'child', printProperties(descrValue)));
    }
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
    ...rest }) => {

  const list = restList(rest);

  return (
    <>
      { capabilities?.length && printCapabilities(capabilities) }
      { Object.keys(attributes).length > 0 && printAttributes(attributes) }
      { Object.keys(children).length > 0 && printChildren(children) }
      { notifications && makeLi('Notifications: ' + notifications) }
      { operations && makeLi('Operations: ' + operations) }
      { minOccurs && makeLi('Min occurs: ' + minOccurs) }
      { maxOccurs && makeLi('Max occurs: ' + maxOccurs) }
      { /*list*/ }
    </>
  );
}

const printAttributes = (attrs) => {
  let list = [];

  for (let attr in attrs) {
    list.push(makeLi(attr, 'attribute', printProperties(attrs[attr])));
  }

  return makeLi('Attributes: ', 'attributes', <ul>{ list }</ul>);
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
    'nil-significant': nilSignifcant,                              // bool
    'filesystem-path': filesystemPath,                             // string
    'capability-reference-pattern-elements': capRef,               // array
    ...rest }) => {

  const list = restList(rest);
  const modelType = getType(type);

  return (
    <>
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
      { accessType && makeLi('Access Type: ' + accessType) }
      { attributeGroup && makeLi('Attribute Group: ' + attributeGroup) }
      { nilSignifcant && makeLi('Nil Significant: ' + nilSignifcant) }
      { filesystemPath && makeLi('Filesystem Path: ' + filesystemPath) }
      { capRef && makeLi('Capability Reference Pattern Elements: ' + capRef) }
      { /*list*/ }
    </>
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
    'max-length': maxLength }) => {

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
        setModel(printProperties(data))
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