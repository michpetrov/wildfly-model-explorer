const makeLi = (text, className, subList) => {
  return (
      <li className={ className }>
        <span>{ text }</span>
        { subList }
      </li>
  );
}

// common to both attr and child
export const printModel = (model, filter) => {

  const restProperties = model.children ? printChildProperties(model, filter)
      : printAttributeProperties(model, filter);

  const commonPropNames = ['description', 'deprecated', 'stability', 'access-constraints'];
  const commonProperties = printProperties(commonPropNames, model, filter, '');

  if (!commonProperties.length && !restProperties.length) {
    return null;
  }

  let areOthersSelected = false;

  Object.entries(filter).forEach(([key, value]) => {
    if (!['attr.show', 'chld.show', 'description'].includes(key) && value && value !== 'OFF') {
      areOthersSelected = true;
    }
  });
  /* because "description" is always present it should not be displayed if there are other active filters and yet the description is the only thing to display */
  if (areOthersSelected && commonProperties.length < 2 && !restProperties.length) {
    return null;
  }

  return (
    <ul>
      { [...commonProperties, ...restProperties] }
    </ul>
  );
}

const printChildProperties = (model, filter) => {

  const { attributes,                         // object
    children,                                 // object
    'min-occurs': minOccurs,                  // number
    'max-occurs': maxOccurs,                  // number
    ...rest } = model;

//  const list = restList(rest);
  const caps = printProperty(model, filter, 'capabilities', 'chld'),
      attrList = printAttributes(attributes, filter),
      childList = printChildren(children, filter),
      notifications = printProperty(model, filter, 'notifications', 'chld'),
      operations = printProperty(model, filter, 'operations', 'chld'),
      minmax = (filter['chld.occurence'] && (minOccurs || maxOccurs)) && printOccurrence(minOccurs, maxOccurs);

  let childProperties = [];
  if (caps) {
    childProperties.push(caps);
  }
  if (attrList.length) {
    childProperties.push(
        makeLi('Attributes: ', 'attributes', <ul>{ attrList }</ul>)
    );
  }
  if (childList.length) {
    childProperties.push(
        makeLi('Children: ', 'children', <ul>{ childList }</ul>)
    );
  }
  if (notifications) {
    childProperties.push(notifications);
  }
  if (operations?.length) {
    childProperties.push(
        makeLi("Operations: ", 'operations', <ul>{ operations }</ul>)
    );
  }
  if (minmax) {
    childProperties.push(minmax);
  }

  // TODO: restlist
  return childProperties;
}

const printAttributeProperties = (model, filter) => {

  const attributePropNames = ['access-type', 'attribute-group','capability-reference',
    'expressions-allowed', 'nillable', /*'required',*/ 'restart-required', /*'type',*/
    /*'value-type',*/ 'storage','default','allowed','alternatives','requires','unit',
    'nil-significant','filesystem-path','capability-reference-pattern-elements'];

//  const list = restList(rest);
  const modelType = getType(model['type']);
  const type = isEqualOrAll(modelType, filter['attr.type']) ? makeLi('Type: ' + modelType + printConstraints(modelType, model)) : null;
  const valueType = (isEqualOrAll(model['value-type'], filter['attr.value-type']) && ['OBJECT', 'LIST'].includes(modelType)) ? printValueType(model['value-type'], filter) : null;
  let attributeProperties = printProperties(attributePropNames, model, filter, 'attr')

  if (type === null && valueType === null && !attributeProperties.length) {
    return [];
  }

  if (valueType !== null) {
    attributeProperties = [valueType, ...attributeProperties];
  }
  if (type !== null) {
    attributeProperties = [type, ...attributeProperties];
  }

  // TODO: restlist
  return attributeProperties;
}

const printChildren = (model, filter) => {
  let children = [];

  if (!filter['chld.show']) {
    return children;
  }

  for (let [key, value] of Object.entries(model)) {
    for (let [descrKey, descrValue] of Object.entries(value['model-description'])) {
      let properties = printModel(descrValue, filter);
      if (properties === null) continue;
      children.push(makeLi(`${key}=${descrKey}`, 'child', properties));
    }
  }

  return children;
}

const printOccurrence = (minOccurs, maxOccurs) => {
  const min = minOccurs != null ? minOccurs : '?';
  const max = maxOccurs != null ? maxOccurs : '?';
  return makeLi(`Occurrence: ${min}-${max}` );
}

const printAttributes = (attrs, filter) => {
  let attributes = [];

  if (!filter['attr.show']) {
    return attributes;
  }

  for (let attr in attrs) {
    let properties = printModel(attrs[attr], filter);
    if (properties !== null) {
      attributes.push(makeLi(attr, 'attribute', properties));
    }
  }

  return attributes;
}

const printCapabilities = (capsArray, name) => {
  let items = capsArray.map(printCapability);

  return makeLi(`${name}: `, 'caps', <ul>{ items }</ul>);
}

const printCapability = ({ name, dynamic, stability }) => {    // bool, string, string
  const list = [
    makeLi(`Dynamic: ${dynamic}`),
    makeLi(`Stability: ${stability}`)
  ];

  return makeLi(name, 'capability', <ul>{ list }</ul>);
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
      if (minToCheck === 1 && maxToCheck === 2147483647) return ""; // default STRING size, don't show
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

const printDeprecated = ({since, reason}, name) => {
  const list = [
    makeLi(`Since: ${since}`),
    makeLi(`Reason: ${reason}`)
  ];

  return makeLi(`${name}: `, 'deprecated', <ul>{ list }</ul>);
}

const printValueType = (valueType, filter) => {
  if (valueType == null) {
    return makeLi('Value Type: NULL'); // why does this occur?
  }
  const type = getType(valueType);
  if (type) {
    return makeLi(`Value Type: ${type}`);
  }

  const attrs = printAttributes(valueType, filter);
  if (attrs.length) {
    return makeLi('Value Type: ', 'value-type', <ul>{ attrs }</ul>);
  }

  return makeLi('Value Type: CUSTOM');
}

const restList = ({ min, max,
                    'min-length': minLength,
                    'max-length': maxLength,
                    ...list}) => {
  return <>{ Object.entries(list).map(([key, value]) => <li>{ `§${key}: ${JSON.stringify(value)}` }</li>) }</>;
}

const printOperations = (operations, name, filterValue) => {
  let ops = [];

  if (filterValue === 'NONE') {
    return ops;
  }

  const COMMON_OPS = ['add', 'remove', 'list-add', 'list-remove',
    'map-clear', 'map-put', 'map-get', 'map-remove'];

  Object.entries(operations).forEach(([key, value]) => {
    if (key === 'add' && value?.['request-properties']?.['add-index']) {
      key = "add (indexed)"
    }
    if ((filterValue === 'non-default' && !COMMON_OPS.includes(key)) || filterValue === 'ALL') {
      ops.push(makeLi(key))
    }
  });

  return ops;
}

// -- generic functions

const isPresent = (value, filterValue) => {
  return (filterValue && value != null);
}

const hasItems = (value, filterValue) => {
  return (filterValue && value?.length);
}

const isSelected = (value, filterValue) => {
  return !!filterValue;
}

const isEqualOrAll = (value, filterValue) => {
  let isEqual = value === filterValue;
  if (typeof value === 'boolean') {
    isEqual = filterValue === (value ? 'TRUE' : 'FALSE');
  }

  return filterValue && (isEqual || filterValue === 'ALL');
}

const makeFnObject = (filterFn, printFn = simplePrint) => {
  return {
    filterFn,
    printFn
  }
}

const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1);
const propToName = (name) => name.split('-').map(capitalize).join(' ');

const simplePrint = (value, name) => makeLi(`${name}: ${value}`);

const dictionaryFn = {
  'description': makeFnObject(isSelected),
  'deprecated': makeFnObject(isPresent, printDeprecated),
  'stability': makeFnObject(isEqualOrAll),
  'access-constraints': makeFnObject(isPresent, (value, name) => makeLi(`${name}: ${JSON.stringify(value)}`)),

  'capabilities': makeFnObject(hasItems, printCapabilities),
  'notifications': makeFnObject(hasItems),
  'operations': makeFnObject(isPresent, printOperations),

  'unit': makeFnObject(isPresent),
  'default': makeFnObject(isPresent),
  'allowed': makeFnObject(isPresent),
  'alternatives': makeFnObject(isPresent),
  'requires': makeFnObject(isPresent),
  'capability-reference': makeFnObject(isPresent),
  'nillable': makeFnObject(isEqualOrAll),
  'expressions-allowed': makeFnObject(isEqualOrAll),
  'restart-required': makeFnObject(isEqualOrAll),
  'access-type': makeFnObject(isEqualOrAll),
  'attribute-group': makeFnObject(isPresent),
  'storage': makeFnObject(isEqualOrAll),
  'nil-significant': makeFnObject(isPresent),
  'filesystem-path': makeFnObject(isPresent),
  'capability-reference-pattern-elements': makeFnObject(isPresent)
}

const printProperty = (resource, filter, name, filterPrefix) => {
  const filterName = filterPrefix ? `${filterPrefix}.${name}` : name;
  let fn = dictionaryFn[name];
  if (!fn) {
    console.error(`no function for ${ name }`);
    return false;
  }
  const value = resource[name],
      filterValue = filter[filterName],
      printFn = fn.printFn || simplePrint;
  return fn.filterFn(value, filterValue) && printFn(value, propToName(name), filterValue);
}

const printProperties = (propNames, resource, filter, filterPrefix) => {
  let list = [];

  propNames.forEach(name => {
    let item = printProperty(resource, filter, name, filterPrefix);
    if (item) {
      list.push(item);
    }
  })

  return list;
}