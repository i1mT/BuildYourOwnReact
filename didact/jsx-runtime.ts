declare global {
  namespace JSX {
    type IntrinsicElements = Record<
      keyof HTMLElementTagNameMap,
      Record<string, any>
    >;
    export type Element = {
      type: string | symbol | ((props: JSX.Element["props"]) => JSX.Element);
      props: Record<string, any> & { children: Array<Element> };
    };
  }
}

export function jsx(
  type: JSX.Element["type"],
  props: JSX.Element["props"],
  ...children: JSX.Element["props"]["children"]
): JSX.Element {
  const _props = props || {};

  return {
    type,
    props: {
      ..._props,
      children: children.map((child) => {
        if (typeof child === "string") {
          return createTextElement(child);
        }
        return child;
      })
    },
  };
}

export const jsxs = jsx;
export const TEXT_ELEMENT = Symbol("TEXT_ELEMENT");
export const FRAGMENT = Symbol('FRAGMENT');

export function fragment(...children: JSX.Element[]) {

  return {
    type: FRAGMENT,
    props: {
      children,
    },
  };
}

function createTextElement(text: string): JSX.Element {
  return {
    type: TEXT_ELEMENT,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
