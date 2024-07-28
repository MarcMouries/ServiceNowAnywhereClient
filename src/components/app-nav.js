import { LOG_STYLE } from "../LogStyles";
import { EVENT_SYS_FETCHED_USER_APPS, EVENT_USER_CLICKED_ON_APP } from '../EventTypes.ts';
import { EventEmitter } from '../EventEmitter.ts';

// src/components/app-nav.js
class AppNav extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    EventEmitter.on(EVENT_SYS_FETCHED_USER_APPS, (itemList) => {
      console.log('%c⑨ Updating app-nav with items', LOG_STYLE);
      this.setItemList(itemList);
    });

    const nav = document.createElement('nav');

    const header = document.createElement('h1');
    header.textContent = 'Items';
    nav.appendChild(header);

    const ul = document.createElement('ul');
    nav.appendChild(ul);
    this.shadowRoot.appendChild(nav);

    const style = document.createElement('style');
    style.textContent = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css');

    :host {
      display: flex;
      height: 100vh;
      width: 100%;
      background-color:#6C79BD;
    }

    nav {
      _margin: 1rem;
      padding: 10px;
      height: 100vh;
      width: 100%;
    }
    h1 {
      font-size: 1.2em;
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
        color: white;
        margin: 10px 0;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        text-align: left;
        transition: background 0.3s ease;
      }
      li:hover {
        background: #6A65C5;
      }
      li i {
        margin-right: 10px;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  setItemList(items) {
    const ul = this.shadowRoot.querySelector('ul');
    ul.innerHTML = ''; // Clear existing content

    items.forEach(item => {
      const li = document.createElement('li');
      const icon = document.createElement('i');
      icon.setAttribute('class', 'fas fa-table');
      li.appendChild(icon);
      li.appendChild(document.createTextNode(item));
      li.addEventListener('click', () => this.handleItemClick(li, item));
      ul.appendChild(li);
    });
  }


  handleItemClick(li, item) {
    // Remove 'active' class from all items
    const ul = this.shadowRoot.querySelector('ul');
    ul.querySelectorAll('li').forEach(li => li.classList.remove('active'));

    // Add 'active' class to the clicked item
    li.classList.add('active');

    console.log(`%cHandling item click: ${item}`, 'color: white; background: darkblue;');
    EventEmitter.emit(EVENT_USER_CLICKED_ON_APP, item);
  }
}

customElements.define('app-nav', AppNav);