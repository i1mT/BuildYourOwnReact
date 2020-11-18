const TEXT_ELEMENT = 'TEXT_ELEMENT'

function createTextElement(text) {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  }
}


function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.filter(c => c != null && c !== false).map(child => {
        return typeof child === 'object' ? child : createTextElement(child)
      }),
    },
  }
}

function render(element, parentDom) {
  const { type, props } = element
  const dom = type === TEXT_ELEMENT ? document.createTextNode('') : document.createElement(type)

  const isListener = name => name.startsWith('on')
  const isAttribute = name => !isListener(name) && name !== 'children'

  // Add event listener
  Object.keys(props).filter(isListener).forEach(name => {
    const eventType = name.toLowerCase().substring(2)
    dom.addEventListener(eventType, props[name])
  })

  // Add attributes
  Object.keys(props).filter(isAttribute).forEach(name => {
    dom[name] = props[name]
  })

  const childElements = props.children || []

  childElements.forEach(el => render(el, dom))

  parentDom.appendChild(dom)
}


export default {
  createElement,
  render,
}