export class Node {

  get textContent() {
    let r = '';
    for (const e of this.#childNodes) {
      r += e.textContent;
    }
    return r;
  }

  /** @param {string} textContent */
  set textContent(textContent) {
    this.#childNodes = new Array();
    this.appendChild(new TextNode(textContent));
  }

  /** @type {Node[]} */
  #childNodes = new Array();
  get childNodes() {
    return this.#childNodes;
  }

  /** @type {Node | null} */
  #parentNode = null;
  get parentNode() {
    return this.#parentNode;
  }

  /**
   * @param {Node} node
   */
  appendChild(node) {
    if (node instanceof Document) return;
    node.#parentNode?.removeChild(node);
    node.#parentNode = this;
    this.#childNodes.push(node);
  }

  /**
   * @param {Node[]} nodes
   */
  append(...nodes) {
    for (const n of nodes) this.appendChild(n);
  }

  /**
   * @param {Node} node
   */
  removeChild(node) {
    const i = this.#childNodes.indexOf(node);
    this.#childNodes.splice(i, 1).forEach(e => e.#parentNode = null);
  }

  /**
   * @returns {string}
   */
  toXML() {
    return this.#childNodes.map((n) => n.toXML()).join('');
  }

}

export class TextNode extends Node {

  /**
   * @param {string?} textContent
   */
  constructor(textContent) {
    super();
    if (textContent) this.textContent = textContent;
  }

  /** @type {string} */
  #textContent = '';
  get textContent() {
    return this.#textContent;
  }
  /** @param {string} textContent */
  set textContent(textContent) {
    this.#textContent = typeof textContent === 'string' ? textContent : String(textContent);
  }

  toXML() {
    return encodeXML(this.#textContent);
  }

}

export class Element extends Node {

  /**
   * @param {string} tagName
   * @param {(Node|string)[]} inner
   */
  constructor(tagName, inner = []) {
    super();
    this.#tagName = tagName;
    for (const n of inner) {
      if (n instanceof Node) this.appendChild(n);
      else this.appendChild(new TextNode(n));
    }
  }

  /**
   * @param {string} tagName
   * @param {(Node|string)[]} inner
   */
  static new(tagName, inner = []) {
    return new Element(tagName, inner);
  }

  #tagName;
  get tagName() {
    return this.#tagName;
  }

  /** @type {Attr[]} */
  #attributes = new Array();
  get attributes() {
    return this.#attributes;
  }

  /**
   * @param {string} name
   */
  getAttribute(name) {
    return this.#attributes.find((a) => a.name === name)?.value;
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  setAttribute(name, value) {
    for (const a of this.#attributes) {
      if (a.name === name) return void (a.value = value);
    }
    this.#attributes.push(new Attr(name, value));
  }

  toXML() {
    const attrstr = this.#attributes.length ? ' ' + this.#attributes.map((a) => a.toXML()).join(' ')  : '';
    if (!this.childNodes.length) {
      return `<${encodeXML(this.tagName)}${attrstr.length ? attrstr + ' ' : ''}/>`;
    } else {
      return `<${encodeXML(this.tagName)}${attrstr}>${
        this.childNodes.map((e) => e.toXML()).join('')
      }</${encodeXML(this.#tagName)}>`;
    }
  }

}

class Attr {

  #name;
  get name() {
    return this.#name;
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  constructor(name, value) {
    this.#name = name;
    this.value = value;
  }

  toXML() {
    return `${encodeXML(this.#name)}="${encodeXML(this.value)}"`;
  }

}

export class Document extends Node {

  constructor() {
    super();
  }

  /**
   * @param {Node} node
   */
  appendChild(node) {
    this.childNodes.splice(0, this.childNodes.length, node);
  }

  toXML() {
    return '<?xml version="1.0" encoding="UTF-8"?>' + this.childNodes.map((e) => e.toXML()).join('');
  }

  /**
   * @param {string} tagName
   */
  createElement(tagName) {
    return new Element(tagName);
  }

  /**
   * @param {string} text
   */
  createTextNode(text) {
    return new TextNode(text);
  }

}

/**
 * @param {string} text
 */
export function encodeXML(text) {
  return text.replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll("'", '&apos;')
    .replaceAll('"', '&quot;');
}
