const form = document.querySelector('.form');
const input = document.querySelector('.form-control');
const list = document.querySelector('.proto-list');

function isModule(value) {
  if (value.endsWith('.js')) {
    return true;
  }
  return false;
}

async function loadModule(src) {
  try {
    const module = await import(`./${src}`);
    window.User = module.default;
  } catch {
    input.classList.add('is-invalid');
    throw TypeError('модуль не найден');
  }
}

function checkClassExist(className) {
  const type = typeof window[className];
  if (type !== 'function') {
    input.classList.add('is-invalid');
    throw TypeError('такого класса нет в window');
  }
}

function getPrototype(className) {
  const protoObj = {};
  const proto = Object.getOwnPropertyNames(className);
  const props = [];

  try {
    protoObj.name = className.prototype.constructor.name;
  } catch (err) {
    protoObj.name = 'Без названия';
  }

  proto.forEach((prop) => {
    const obj = {
      name: prop,
      type: typeof (className[prop]),
    };
    props.push(obj);
  });

  protoObj.props = props;

  return protoObj;
}

function getPrototypesChain(classInitial) {
  let classCurrent = window[classInitial];
  const protoChain = [];

  do {
    const protoObj = getPrototype(classCurrent);

    protoChain.push(protoObj);
    classCurrent = Object.getPrototypeOf(classCurrent);
  } while (Object.getPrototypeOf(classCurrent) !== Object.prototype);
  const obj = getPrototype(Object);
  protoChain.push(obj);

  return protoChain;
}

function createList(chain) {
  chain.forEach((classItem) => {
    const classElem = document.createElement('li');
    classElem.classList.add('list-group-item');
    classElem.textContent = classItem.name;

    const propsElem = document.createElement('ol');
    propsElem.classList.add('props-list', 'list-group', 'list-group-numbered');

    classItem.props.forEach((prop) => {
      const propElem = document.createElement('li');
      propElem.classList.add('list-group-item', 'border-0');
      propElem.textContent = `${prop.name} - type: ${prop.type}`;

      propsElem.append(propElem);
    });

    classElem.append(propsElem);
    list.append(classElem);
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  list.innerHTML = '';

  const value = input.value.trim();
  if (isModule(value)) {
    input.value = '';
    loadModule(value);
    return;
  }

  checkClassExist(value);
  const protos = getPrototypesChain(value);
  createList(protos);
  input.value = '';
});

input.addEventListener('click', () => {
  input.classList.remove('is-invalid');
  input.value = '';
});
