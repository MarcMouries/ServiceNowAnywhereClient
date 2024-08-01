// src/components/app-view.js
import { initializeApp } from "./app-controller";
import { LOG_STYLE } from "./LogStyles.ts";
import { EventEmitter } from "./EventEmitter.ts";

const template = document.createElement("template");
template.innerHTML = `
<app-nav home-location="./workspace.html"></app-nav>
<app-content></app-content>
    <style>
        :host {
  display: flex;
  height: 100vh;
  width: 100%;
}
  app-nav {
    width: 20%;
  }
  app-content {
    width: 80%;
    padding: 20px;
  }
`;

class AppView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    console.log("%c⑨ App View connected", LOG_STYLE);
    console.log("%c⑩ Calling initializeApp", LOG_STYLE);
    initializeApp();
  }
}

customElements.define("app-view", AppView);
