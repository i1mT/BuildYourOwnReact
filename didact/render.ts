export function render(element, container) {
  const dom = document.createElement(element.type);
  dom.innerHTML = element.props.children;
  container.appendChild(dom);
}
