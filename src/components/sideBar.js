// src/components/sideBar.js

import { LOG_STYLE } from "../LogStyles";
import { EVENT_SYS_FETCHED_USER_APPS, EVENT_USER_CLICKED_ON_APP } from '../EventTypes.ts';
import { EventEmitter } from '../EventEmitter.ts';

const template = document.createElement('template');
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
        background : var(--sideBar-background);
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
        margin-bottom: 10px;
        border-radius: var(--border-radius);
        color: var(--sideBar-text-color);
        cursor: pointer;
        padding: 6px 8px;
        text-align: left;
        transition: background 0.3s ease;
    }
    li:hover, li.active {
        background: var(--hover-color);
        font-weight: 400;
    }
    li i {
        margin-right: 10px;
    }
</style>
`;

class SideBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Set the default home location
        this.homeLocation = this.getAttribute('home-location') || '/';

        // Add home item by default
        this.addListItem('Home', 'fas fa-home', (li) => this.handleHomeClick(li));

        EventEmitter.on(EVENT_SYS_FETCHED_USER_APPS, (appList) => {
            console.log('%c⑨ Updating app-sideBar with items', LOG_STYLE);
            this.setAppsList(appList);
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

    addListItem(text, iconClass, clickHandler) {
        const ul = this.shadowRoot.querySelector('ul');
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.setAttribute('class', iconClass);
        li.appendChild(icon);
        li.appendChild(document.createTextNode(text));
        li.addEventListener('click', () => clickHandler(li));
        ul.appendChild(li);
    }

    setAppsList(apps) {
        const ul = this.shadowRoot.querySelector('ul');
        // Clear existing content except for the home item
        ul.querySelectorAll('li:not(:first-child)').forEach(li => li.remove());

        apps.forEach(app => {
            this.addListItem(app.appName, 'fas fa-list', (li) => this.handleAppClick(li, app));
        });
    }

    handleHomeClick(li) {
        this.updateActiveClass(li);
        console.log(`%cHandling home click, redirect to ${this.homeLocation}`, 'color: white; background: darkblue;');
        history.pushState(null, '', this.homeLocation); // Update the URL without reloading the page
        EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, 'home'); 
    }

    handleAppClick(li, app) {
        this.updateActiveClass(li);
        console.log(`%cHandling app click: ${app.appName} with scope: ${app.appScope}`, 'color: white; background: darkblue;');
        EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, app);
    }

    updateActiveClass(activeLi) {
        const ul = this.shadowRoot.querySelector('ul');
        ul.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        activeLi.classList.add('active');
    }
}

customElements.define('side-bar', SideBar);
