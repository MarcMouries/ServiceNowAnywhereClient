class Applications extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');

    const header = document.createElement('h1');
    header.textContent = 'Applications';
    wrapper.appendChild(header);

    const ul = document.createElement('ul');
    wrapper.appendChild(ul);
    this.shadowRoot.appendChild(wrapper);

    const style = document.createElement('style');
    style.textContent = `
      h1 {
        color: white;
        font-size: 1.5em;
        margin: 20px 0;
        text-align: center;
      }
      ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
        width: 100%;
      }
      li {
        background: #333;
        color: white;
        margin: 5px 0;
        padding: 15px;
        border-radius: 5px;
        cursor: pointer;
        text-align: left; /* Align text to the left */
        padding-left: 20px; /* Add padding to align text properly */
      }
      li:hover {
        background: #444;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  // Method to set the list of applications
  setApplications(applications) {
    const ul = this.shadowRoot.querySelector('ul');

    applications.forEach(app => {
      const li = document.createElement('li');
      li.textContent = app;
      li.addEventListener('click', () => this.handleAppClick(app));
      ul.appendChild(li);
    });

    // Clear existing content and append the new list
    ul.innerHTML = '';
    applications.forEach(app => {
      const li = document.createElement('li');
      li.textContent = app;
      li.addEventListener('click', () => this.handleAppClick(app));
      ul.appendChild(li);
    });
  }

  handleAppClick(app) {
    const event = new CustomEvent('element-selected', {
      detail: { appName: app },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('app-list', Applications);
