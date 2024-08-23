// src/components/sideBar.js

import { LOG_STYLE } from "../LogStyles";
import { EVENT_SYS_FETCHED_USER_APPS, EVENT_USER_CLICKED_ON_APP, EVENT_USER_CLICKED_ON_TABLE, EVENT_SYS_FETCHED_USER_TABLES } from "../EventTypes.ts";
import { EventEmitter } from "../EventEmitter.ts";

const template = document.createElement("template");
template.innerHTML = `
<sideBar>
    <h1>Items</h1>
    <ul></ul>
</sideBar>
<style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css');

    * {
    box-sizing: border-box;
}
:host {
    display: flex;
    height: 100vh;
    width: 100%;
    background: var(--sideBar-background);
    border-right: 1px solid var(--sideBar-border-right);
}

sideBar {
    padding: var(--padding);
    height: 100vh;
    width: 100%;
}
h1 {
    font-size: var(--font-size-header);
    margin: 0 0 20px;
    text-align: center;
}
ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    width: 100%;
}
li {
    margin-bottom: 5px;
    border-radius: var(--border-radius);
    color: var(--sideBar-text-color);
    cursor: pointer;
    padding: 6px 8px;
    text-align: left;
    transition: background 0.3s ease, color 0.3s ease;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}

/* Highlight only the hovered li */
li:hover {
    background: var(--hover-color);
}

/* Ensure only the text of the app item itself is bold, not its children */
.app-item.active > i,
.app-item.active > span,
.app-item.active > div {
    font-weight: bold;
    color: var(--sideBar-text-color);  /* Ensure the color stays consistent */
}

/* Remove background from child elements to ensure only the current li is highlighted */
li .nested li:hover {
    background: none;
}

/* Apply hover effect specifically to app and table items */
.app-item > i:hover,
.app-item > span:hover,
.table-item > i:hover,
.table-item > span:hover {
    background: var(--hover-color);
    font-weight: 400;
}

.table-item.active {
    background: var(--hover-color);  /* Same background as hover state */
    font-weight: 400;  /* Keep table font weight normal */
    color: var(--sideBar-text-color);  /* Ensure the text color stays consistent */
}

li i {
    margin-right: 10px;
}

.nested {
    display: none;
    padding-left: 20px;
}

.app-item.active .nested {
    display: block;
}



</style>
`;

class SideBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.homeLocation = this.getAttribute("home-location") || "/";

    // Add home item by default
    this.addListItem("Home", "fas fa-home", (li) => this.handleHomeClick(li), "home");

    EventEmitter.on(EVENT_SYS_FETCHED_USER_APPS, (appList) => {
      console.log("%c⑨ Updating app-sideBar with items", LOG_STYLE);
      this.setAppsList(appList);
    });

    EventEmitter.on(EVENT_SYS_FETCHED_USER_TABLES, ({ appName, tableList }) => {
      console.log(`%cUpdating tables for app: ${appName}`, LOG_STYLE);
      this.setTables(appName, tableList);
    });
  }

  static get observedAttributes() {
    return ["home-location"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "home-location" && oldValue !== newValue) {
      this.homeLocation = newValue;
    }
  }

  addListItem(text, iconClass, clickHandler, itemType, parentUl = null) {
    const ul = parentUl || this.shadowRoot.querySelector("ul");
    const li = document.createElement("li");
    li.classList.add(`${itemType}-item`);
    const icon = document.createElement("i");
    icon.setAttribute("class", iconClass);
    li.appendChild(icon);
    li.appendChild(document.createTextNode(text));
    li.addEventListener("click", (event) => {
      event.stopPropagation();
      clickHandler(li);
    });
    ul.appendChild(li);
    return li;
  }

  setAppsList(apps) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.querySelectorAll(".app-item, .table-item").forEach((li) => li.remove());

    apps.forEach((app) => {
      const appLi = this.addListItem(app.appName, "fas fa-folder", (li) => this.handleAppClick(li, app), "app");
      const nestedUl = document.createElement("ul");
      nestedUl.classList.add("nested");
      appLi.appendChild(nestedUl);
      appLi.dataset.appScope = app.appScope;
    });
  }

  setTables(appName, tableList) {
    const appLi = this.shadowRoot.querySelector(`.app-item[data-app-scope="${appName}"]`);
    if (!appLi) return;
    const ul = appLi.querySelector(".nested");
    ul.innerHTML = "";
    tableList.forEach((table) => {
      this.addListItem(table.label, "fas fa-table", (li) => this.handleTableClick(li, table), "table", ul);
    });
  }

  handleHomeClick(li) {
    this.updateActiveClass(li, "home-item");
    console.log(`%cSideBar: Handling home click, redirect to ${this.homeLocation}`, "color: white; background: darkblue;");
    history.pushState(null, "", this.homeLocation);
    EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, "home");
  }

  handleAppClick(li, app) {
    this.updateActiveClass(li, "app-item");
    console.log(`%cSideBar: Handling app click: ${app.appName} with scope: ${app.appScope}`, "color: white; background: darkblue;");
    EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, app);
    const nested = li.querySelector(".nested");
    nested.style.display = nested.style.display === "block" ? "none" : "block";
  }

  handleTableClick(li, table) {
    this.updateActiveClass(li, "table-item");
    console.log(`%cSideBar: Handling table click: ${table.label} (${table.name})`, "color: white; background: darkblue;");
    EventEmitter.emit(EVENT_USER_CLICKED_ON_TABLE, { tableName: table.name });
  }

  updateActiveClass(activeLi, itemType) {
    const ul = this.shadowRoot.querySelector("ul");
    ul.querySelectorAll(`.${itemType}`).forEach((li) => li.classList.remove("active"));
    activeLi.classList.add("active");
  }
}

customElements.define("side-bar", SideBar);
