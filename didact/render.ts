import { FRAGMENT, TEXT_ELEMENT } from "./jsx-runtime.ts";

interface Fiber {
  dom: HTMLElement | Text | null;
  props: JSX.Element["props"];
  type: JSX.Element["type"];
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null; // old fiber
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION";
  hooks?: any[];
}

const setDomName = (dom: HTMLElement | Text, name: string, value: any) => {
  if (dom instanceof Text) return;
  
  if (name.startsWith('on')) {
    const eventType = name.toLocaleLowerCase().substring(2);
    dom.addEventListener(eventType, value);
  } else if (name === "style") {
    Object.keys(value).forEach(key => {
      dom.style[key] = value[key];
    })
  } else if (name === "className") {
    dom.setAttribute("class", value);
  } else {
    dom[name] = value;
  }
}

const createDom = (fiber: Fiber): HTMLElement | Text => {
  console.log("[Didact] createDom");
  const { type, props } = fiber;
  const _props = props || {};

  let dom: HTMLElement | Text;
  if (type === TEXT_ELEMENT) {
    dom = document.createTextNode(props.nodeValue);
  } else {
    dom = document.createElement(type as string);
  }

  updateDom(dom, {}, _props);

  return dom;
};

export function renderFragment(
  elements: JSX.Element[],
  container: HTMLElement | Text,
) {
  elements.forEach((element) => {
    render(element, container);
  });
}

export function render(element: JSX.Element, container: HTMLElement | Text) {
  console.log("[Didact] render");
  // set next unit of work
  wipRoot = {
    dom: container,
    props: element.props,
    type: element.type,
    alternate: currentRoot,
    child: null,
    parent: null,
    sibling: null,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
  requestIdleCallback(workLoop);
}

let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Fiber[] = [];

function commitRoot() {
  console.log("[Didact] commitRoot");
  deletions.forEach(commitWork);
  // add node to dom
  commitWork(wipRoot?.child || null);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: Fiber | null) {
  console.log("[Didact] commitWork", fiber);
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    // domParentFiber is an function component
    domParentFiber = domParentFiber?.parent;
  }
  const domParent = domParentFiber!.dom!;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    // add
    domParent.appendChild(fiber.dom!);
  } else if (fiber.effectTag === "DELETION") {
    // delete
    commitDeletion(fiber, domParent);
  } else if (fiber.dom && fiber.effectTag === "UPDATE") {
    // update
    updateDom(fiber.dom, fiber.alternate!.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline: IdleDeadline) {
  console.log("[Didact] workLoop");
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // stop while idle time remaining is less than 1ms
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber: Fiber): Fiber | null {
  console.log("[Didact] performUnitOfWork");

  // create dom, and childern fibers
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // return the next unit of work
  if (fiber.child) {
    return fiber.child;
  }
  // find sibling
  let nextFiber: Fiber | null = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }

  return null;
}

function reconcileChildren(wipFiber: Fiber, elements: JSX.Element[]) {
  let index = 0;
  let prevSibling: Fiber | null = null;
  let oldFiber: Fiber | null = wipFiber.alternate && wipFiber.alternate.child;

  while (index < elements.length) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    // compare old fiber to element
    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        child: null,
        sibling: null,
      };
    }
    if (element && !sameType) {
      // add this node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
        child: null,
        sibling: null,
      };
    }
    if (oldFiber && !sameType) {
      // delete the old node
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling!.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function updateTextNode(dom: Text, prevProps: JSX.Element["props"], nextProps: JSX.Element["props"]) {
  if (prevProps.nodeValue !== nextProps.nodeValue) {
    dom.nodeValue = nextProps.nodeValue;
  }
}

function updateDom(
  dom: HTMLElement | Text,
  prevProps: JSX.Element["props"],
  nextProps: JSX.Element["props"],
) {
  console.log("[Didact] updateDom", dom, prevProps, nextProps);
  
  if (dom instanceof Text) {
    updateTextNode(dom, prevProps, nextProps);
    return;
  }

  const { children: _nextChildren, ..._nextProps } = nextProps || {};
  const { children: _prevChildren, ..._prevProps } = prevProps || {};

  const isNew =
    (prev: JSX.Element["props"], next: JSX.Element["props"]) => (key: string) =>
      prev[key] !== next[key];
  const isGone =
    (next: JSX.Element["props"]) => (key: string) =>
      !(key in next);
  const isEvent = (key: string) => key.startsWith("on");

  // remove old or changed event listeners
  Object.keys(_prevProps)
    .filter(isEvent)
    .filter((key) => !(key in _nextProps) || isNew(_prevProps, _nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, _prevProps[name]);
    });

  // remove old properties
  Object.keys(_prevProps).filter(isGone(_nextProps)).forEach(
    (name) => {
      setDomName(dom, name, undefined);
    },
  );

  // add/update properties
  Object.keys(_nextProps).filter(isNew(_prevProps, _nextProps)).forEach(
    (name) => {
      setDomName(dom, name, _nextProps[name]);
    },
  );

  // add new event listeners
  Object.keys(_nextProps)
    .filter(isEvent)
    .filter(isNew(_prevProps, _nextProps))
    .forEach((name) => {
      console.log('add listener', name);
      const eventType = name.toLocaleLowerCase().substring(2);
      dom.addEventListener(eventType, _nextProps[name]);
    });
}


function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props?.children || []);
}

let wipFiber: Fiber | null = null;
let hookIndex = 0;

function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const { type, props } = fiber;
  const children = (type as Function)(props);

  reconcileChildren(fiber, [children]);
}

function commitDeletion(fiber: Fiber, domParent: HTMLElement) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child!, domParent);
  }
}


/**
 * hooks
 */
type SetState<T> = (v: T | ((v: T) => T)) => void;
export function useState<T>(initial: T): [T, SetState<T>] {
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  }

  wipFiber?.hooks?.push(hook);
  hookIndex++;

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = typeof action === 'function' ? action(hook.state) : action;
  })

  const setState: SetState<T> = (v) => {
    hook.queue.push(v);

    wipRoot = {
      dom: currentRoot?.dom,
      props: currentRoot?.props,
      type: currentRoot?.type,
      alternate: currentRoot,
      child: null,
      parent: null,
      sibling: null,
    }
    nextUnitOfWork = wipRoot;
    deletions = [];
  };
  
  return [hook.state, setState];
}
