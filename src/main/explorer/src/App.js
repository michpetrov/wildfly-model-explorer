import React, { useState, useRef } from 'react';
import logo from './logo.svg';
import './App.css';

import DigestClient from 'digest-fetch';

/*
Child:
    - description: string
    - model-description
        - <*|name>: child-desc
*/

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
    stability,
    ...rest }) => {

  return (
    <ul>
      { makeLi('Description: ' + description) }
      { capabilities?.length && printCapabilities(capabilities) }
      { Object.keys(attributes).length > 0 && printAttributes(attributes) }
      { Object.keys(children).length > 0 && printChildren(children) }
      { notifications && makeLi('Notifications: ' + notifications) }
      { operations && makeLi('Operations: ' + operations) }
      { stability && makeLi('Stability: ' + stability) }
      { Object.entries(rest).forEach(a => <li>{a}*</li>)}
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
    'min-length': minLength,
    'max-length': maxLength,
    nillable,
    required,
    'restart-required': restartRequired,
    stability,
    storage,
    type,
    ...rest }) => {

  return (
    <ul>
      { makeLi('Description: ' + description) }
      { makeLi('Type: ' + type['TYPE_MODEL_VALUE']) }
      { capabilityReference && makeLi('CapabilityReference: ' + capabilityReference) }
      { minLength && makeLi('Min length: ' + minLength) }
      { maxLength && makeLi('Max length: ' + maxLength) }
      { makeLi('Nillable: ' + nillable) }
      { makeLi('Expressions allowed: ' + expressionsAllowed) }
      { restartRequired && makeLi('Restart required: ' + restartRequired) }
      { makeLi('Storage: ' + storage) }
      { accessType && makeLi('Access Type: ' + accessType) }
      { attributeGroup && makeLi('Attribute Group: ' + attributeGroup) }
      { makeLi('Stability: ' + stability) }
      { Object.entries(rest).forEach(a => <li>{a}*</li>)}
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

const App = () => {
  const [model, setModel] = useState(null);
  const client = new DigestClient(process.env.REACT_APP_USERNAME,process.env.REACT_APP_PASSWORD);

  let target = "subsystem/batch-jberet";
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
          <span>{ url }</span><input ref={ inputRef } defaultValue={ target } type="text"/><span>{ op }</span>
      </div>
      <button onClick={ fetchData }>Fetch</button>
      <div className="output">{ model }</div>
    </div>
  );
}

export default App;
