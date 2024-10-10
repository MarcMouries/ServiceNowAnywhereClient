// src/components/app-view.js
import appController from './app-controller';
import { LOG_STYLE } from "./LogStyles.ts";
import { EventEmitter } from "./EventEmitter.ts";
import Router from "./components/router";

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
      padding-top: var(--title-bar-height);
  }
  main {
      background: slategray;
      display: flex;
      width: 80%;
}
.hidden {
  display: none;
}


</style>

<side-bar home-location="./workspace.html"></side-bar>

<main></main>`;

// <list-view></list-view>
// <record-view></record-view>

class AppView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    console.log("%c⑨ App View connected", LOG_STYLE);
    console.log("%c⑩ Calling initializeApp", LOG_STYLE);
    appController.initializeApp();

    const tauriToolbar = document.querySelector('div[data-tauri-decorum-tb]');
    if (tauriToolbar) {
      console.log( "found tauriToolbar");
    }
    else {
      console.log( "NOT found tauriToolbar");

    }


    const routes = {
      '/list/:table': ({ table, tableData }) => {
          this.showTableContent(table, tableData);
      },
      '/record/:table/:sysId': ({ table, sysId, recordData }) => {
          this.showRecordView(table, sysId, recordData);
      }
    };
  
    const router = new Router(routes);

    this.attachEventListeners(router);
  }

  showTableContent(table, tableData) {
    const main = this.shadowRoot.querySelector("main");
    main.innerHTML = `<list-view></list-view>`;
    const listView = main.querySelector("list-view");
    if (listView) {
      listView.setContent(table, tableData);
    }
  }

  showRecordView(table, sysId, recordData) {
    const main = this.shadowRoot.querySelector("main");
    main.innerHTML = `<record-view></record-view>`;
    const recordView = main.querySelector("record-view");
    if (recordView) {
      recordView.displayRecord(table, recordData);
    }
  }

  attachEventListeners(router) {
    EventEmitter.on("navigate", (path, payload) => {
      console.log("App View received Navigate event for path: " + path);

      router.navigate(path, payload);
    });
  }
}

customElements.define("app-view", AppView);