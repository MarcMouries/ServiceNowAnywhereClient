// src/components/sideBar.js

import { LOG_STYLE } from "../LogStyles";
import { 
    EVENT_SYS_FETCHED_USER_APPS,
    EVENT_USER_CLICKED_ON_APP,
    EVENT_USER_CLICKED_ON_TABLE,
    EVENT_SYS_FETCHED_USER_TABLES
} from '../EventTypes.ts';
import { EventEmitter } from '../EventEmitter.ts';

const template = document.createElement('template');
template.innerHTML = `
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
    .sidebar-content {
        width: 100%;
    }
    .home-item, .app-item, .table-item {
        color: var(--sideBar-text-color);
        cursor: pointer;
        padding-left: 10px;
        padding-top: 6px;
        text-align: left;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        margin-bottom: 5px;
        transition: color 0.3s ease, text-decoration 0.3s ease;
    }
    .home-item {
        padding-left: 10px; /* Ensure the Home item aligns with the other elements */
    }
    .home-item:hover,
    .app-item:hover,
    .table-item:hover {
        text-decoration: underline; /* Underline the text on hover */
        background: none; /* Ensure the background does not change */
    }
    .home-item.active,
    .app-item.active {
        font-weight: bold;
        color: var(--sideBar-text-color);
    }
    .table-item.active {
        background: var(--hover-color); /* Set background color when active */
        font-weight: 400;
        color: var(--sideBar-text-color);
    }
    .table-item {
        padding-left: 20px; /* Add left padding to tables for indentation */
    }
    .sidebar-content i {
        margin-right: 10px;
    }
    .nested {
        display: none;
    }
    .app-container.active .nested {
        display: block;
    }
</style>

<sideBar>
    <div class="sidebar-content"></div>
</sideBar>`;

class SideBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.homeLocation = this.getAttribute('home-location') || '/';

        // Add home item by default
        this.addItem('Home', 'fas fa-home', (div) => this.handleHomeClick(div), 'home');

        EventEmitter.on(EVENT_SYS_FETCHED_USER_APPS, (payload) => {
            console.log("Sidebar: received event with payload: ", payload);
            this.setUserAppsList(payload.appList);
        });


        EventEmitter.on(EVENT_SYS_FETCHED_USER_TABLES, (payload) => {
            console.log("Sidebar: Updating table list with payload: ", payload);
            this.setTables(payload.app, payload.tableList);
        });

    }

    static get observedAttributes() {
        return ['home-location'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'home-location' && oldValue !== newValue) {
            this.homeLocation = newValue;
        }
    }

    addItem(text, iconClass, clickHandler, itemType, parentDiv = null) {
        const container = parentDiv || this.shadowRoot.querySelector('.sidebar-content');
        const div = document.createElement('div');
        div.classList.add(`${itemType}-item`);
        const icon = document.createElement('i');
        icon.setAttribute('class', iconClass);
        div.appendChild(icon);
        div.appendChild(document.createTextNode(text));
        div.addEventListener('click', (event) => {
            event.stopPropagation();
            clickHandler(div);
        });
        container.appendChild(div);
        return div;
    }

    setUserAppsList(appList) {
        console.log("Sidebar: setUserAppsList with appList: ", appList);

        const container = this.shadowRoot.querySelector('.sidebar-content');
        container.querySelectorAll('.app-container').forEach((div) => div.remove());

        appList.forEach((app) => {
            const appContainer = document.createElement('div');
            appContainer.classList.add('app-container');
            const appDiv = this.addItem(app.appName, 'fas fa-folder', (div) => this.handleAppClick(div, appContainer, app), 'app', appContainer);
            const nestedDiv = document.createElement('div');
            nestedDiv.classList.add('nested');
            appContainer.appendChild(appDiv);
            appContainer.appendChild(nestedDiv);
            container.appendChild(appContainer);
            appContainer.dataset.appScope = app.appScope;
        });
    }

    setTables(app, tableList) {
        console.log("Sidebar: setTables with app: ", app);
        console.log("Sidebar: setTables with tableList: ", tableList);
        const appContainer = this.shadowRoot.querySelector(`.app-container[data-app-scope="${app.appScope}"]`);
        if (!appContainer) return;
        const nestedDiv = appContainer.querySelector('.nested');
        nestedDiv.innerHTML = '';
        tableList.forEach((table) => {
            this.addItem(table.label, 'fas fa-table', (div) => this.handleTableClick(div, table), 'table', nestedDiv);


        });
    }

    handleHomeClick(div) {
        this.updateActiveClass(div, 'home-item');
        console.log(`%cSideBar: Handling home click, redirect to ${this.homeLocation}`, 'color: white; background: darkblue;');
        history.pushState(null, '', this.homeLocation);
        EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, { appName: "home" });
    }

    handleAppClick(div, appContainer, app) {
        this.updateActiveClass(div, 'app-item');
        console.log(`%cSideBar: Handling app click: ${app.appName} with scope: ${app.appScope}`, 'color: white; background: darkblue;');
        EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, app);
        appContainer.classList.toggle('active');
    }

    handleTableClick(div, table) {
        this.updateActiveClass(div, 'table-item');
        console.log(`%cSideBar: Handling table click: ${table.label} (${table.name})`, 'color: white; background: darkblue;');
        EventEmitter.emit(EVENT_USER_CLICKED_ON_TABLE, { table });
    }

    updateActiveClass(activeDiv, itemType) {
        const container = this.shadowRoot.querySelector('.sidebar-content');
        container.querySelectorAll(`.${itemType}`).forEach((div) => div.classList.remove('active'));
        activeDiv.classList.add('active');
    }
}

customElements.define('side-bar', SideBar);
