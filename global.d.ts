declare global {

  module JSX {
    type IntrinsicElements = Record<
    keyof HTMLElementTagNameMap,
    Record<string, any>
    >;
    export type Element = {
      type: string | symbol | ((props: JSX.Element['props']) => JSX.Element);
      props: Record<string, any> & { children: Array<Element> };
    };
  }
}
