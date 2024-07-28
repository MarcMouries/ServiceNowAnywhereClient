// src/components/app-view.js
import { initializeApp } from './app-controller';
import { LOG_STYLE } from './LogStyles.ts';
import { EventEmitter } from './EventEmitter.ts';

class AppView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const nav = document.createElement('app-nav');
    const content = document.createElement('app-content');
    this.shadowRoot.appendChild(nav);
    this.shadowRoot.appendChild(content);

    const style = document.createElement('style');
    style.textContent = `
    :host {
      display: flex;
      height: 100vh;
      width: 100%;
      background-color: #f3f4f6;
    }
      app-nav {
        width: 20%;
        border-right: 1px solid #ddd;

      }
      app-content {
        width: 80%;
        padding: 20px;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  connectedCallback() {
    console.log('%c⑨ App View connected', LOG_STYLE);
    console.log('%c⑩ Calling initializeApp', LOG_STYLE);
    initializeApp();
  }
}

customElements.define('app-view', AppView);
