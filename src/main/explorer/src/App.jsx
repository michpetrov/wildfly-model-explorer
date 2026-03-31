import React, { useEffect, useState, useRef } from 'react';
import Datalist from './Datalist.jsx';
import Filter from './Filter.jsx';
import { printModel } from './FilterWriter.jsx';
import './App.css';

import DigestClient from 'digest-fetch';

const Alert = ({type, message}) => <div className={'alert ' + type}>{message}</div>;

const App = () => {
  const defaultFilter = {
    "description": true,
    "attr.show": true,
    "chld.show": false
  };
  const EMPTY_ALERT = {type: '', message: ''};

  const [alert, setAlert] = useState(EMPTY_ALERT);
  const [subs, setSubs] = useState([]);
  const [data, setData] = useState(null);
  const filterHook = useState(defaultFilter);
  const client = new DigestClient(import.meta.env.VITE_EXPL_USERNAME,import.meta.env.VITE_EXPL_PASSWORD);

  let target = "subsystem/jgroups";
  const url = 'http://localhost:9990/management/';
  const op = '?operation=resource-description&recursive=true&operations=true&inherited=false';
  const subsOp = '?operation=resource'; // HTTP API doesn't support "children-names" operation

  const inputRef = useRef(null);

  useEffect(() => {
    client.fetch(url + subsOp)
        .then(data => data.json())
        .then(data => {
          let subsystems = [];
          for (let sub in data['subsystem']) {
            subsystems.push(sub);
          }
          setSubs(subsystems);
        })
        .catch(e => {
          console.log(e);
          setAlert({type: 'error', message: e.message});
        })
      },
    [1]);

  const clearAlert = () => setAlert(EMPTY_ALERT);

  const fetchData = () => client.fetch(url + inputRef.current.value + op)
      .then(data => data.json())
      .then(data => {
        console.log(data);
        if (data?.outcome === 'failed') {
          setAlert({type: "error", message: data['failure-description']});
        } else {
          clearAlert();
          setData(data);
        }
      })
      .catch(e => {
        console.log(e);
        setAlert({type: 'error', message: e.message});
      });

  const model = data ? printModel(data, filterHook[0]) : null;

  return (
    <div className="App">
      <div className="address">
        <span>{ url }</span><Datalist inputRef={ inputRef } list={ subs } defaultValue={ target }/><span>{ op }</span>
        <button onClick={ fetchData }>Fetch</button>
      </div>
      { alert.message && <Alert type={alert.type} message={alert.message} /> }
      <Filter filterHook={ filterHook } />
      { model && <div className="output">{ model }</div> }
    </div>
  );
}

export default App;