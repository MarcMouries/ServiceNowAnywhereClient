class OnlineStatus extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'online-status');

    const iconFA = document.createElement('i'); // font awesome

    const icon = document.createElement('img');
    const text = document.createElement('span');

    wrapper.appendChild(iconFA);
    wrapper.appendChild(icon);
    wrapper.appendChild(text);
    this.shadowRoot.appendChild(wrapper);

    const style = document.createElement('style');
    style.textContent = `
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css');
    .online-status {
        display: flex;
        align-items: center;
        position: fixed;
        top: 10px;
        right: 10px;
        background: white;
        padding: 5px 10px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        z-index: 1000;
      }
      .online-status img {
        margin-right: 5px;
        width: 20px; /* Adjust size as needed */
        height: 20px; /* Adjust size as needed */
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  connectedCallback() {
    this.updateStatus();
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  disconnectedCallback() {
    window.removeEventListener('online', this.updateStatus.bind(this));
    window.removeEventListener('offline', this.updateStatus.bind(this));
  }

  updateStatus() {
    const isOnline = navigator.onLine;
    const iconFA = this.shadowRoot.querySelector('i');

    const icon = this.shadowRoot.querySelector('img');
    const text = this.shadowRoot.querySelector('span');

    if (isOnline) {
      iconFA.setAttribute('class', 'fas fa-wifi');
      icon.src = '/assets/wifi.svg';
      text.textContent = 'You are currently online';
    } else {
      iconFA.setAttribute('class', 'fas fa-wifi-slash');
      icon.src = '/assets/wifi-slashed.svg';
      text.textContent = 'You are currently offline';
    }
  }
}

customElements.define('online-status', OnlineStatus);
