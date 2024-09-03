// src/components/app-view.js
import { initializeApp } from "./app-controller";
import { LOG_STYLE } from "./LogStyles.ts";
import { EventEmitter } from "./EventEmitter.ts";

const template = document.createElement("template");
template.innerHTML = `
<style>
  :host {
      display: flex;
      height: 100vh;
      width: 100%;
  }
  side-bar {
      width: 20%;
  }
  main {
      width: 80%;
      padding: 10px;
      background: slategray;
      display: flex;
}
.hidden {
  display: none;
}

</style>

<side-bar home-location="./workspace.html"></side-bar>
<main>
  <list-view></list-view>
  <record-view></record-view>
</main>
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
