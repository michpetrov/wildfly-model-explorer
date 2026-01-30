import React, { useEffect, useState, useRef } from 'react';
import Datalist from './Datalist';
import Filter from './Filter';
import { printModel } from './FilterWriter';
import './App.css';

import DigestClient from 'digest-fetch';

const App = () => {
  const defaultFilter = {
    "description": true,
    "attr.show": true,
    "chld.show": false
  }
  const [subs, setSubs] = useState([]);
  const [data, setData] = useState(null);
  const filterHook = useState(defaultFilter);
  const client = new DigestClient(process.env.REACT_APP_USERNAME,process.env.REACT_APP_PASSWORD);

  let target = "subsystem/jgroups";
  const url = 'http://localhost:9990/management/';
  const op = '?operation=resource-description&recursive=true&operations=true&inherited=false';
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

  const model = data ? printModel(data, filterHook[0]) : null;

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