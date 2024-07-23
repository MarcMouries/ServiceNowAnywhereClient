class OnlineStatus extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'online-status');

    const icon = document.createElement('i');
    const text = document.createElement('span');

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
      .online-status i {
        margin-right: 5px;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  connectedCallback() {
    console.log('OnlineStatus connected to the DOM');
    this.updateStatus();
    window.addEventListener('online', this.updateStatus.bind(this));
    window.addEventListener('offline', this.updateStatus.bind(this));
  }

  disconnectedCallback() {
    console.log('OnlineStatus disconnected from the DOM');
    window.removeEventListener('online', this.updateStatus.bind(this));
    window.removeEventListener('offline', this.updateStatus.bind(this));
  }

  updateStatus() {
    console.log('OnlineStatus updateStatus called');
    const isOnline = navigator.onLine;
    const icon = this.shadowRoot.querySelector('i');
    const text = this.shadowRoot.querySelector('span');

    if (isOnline) {
      icon.setAttribute('class', 'fas fa-wifi');
      text.textContent = 'You are currently online';
    } else {
      icon.setAttribute('class', 'fas fa-wifi-slash');
      text.textContent = 'You are currently offline';
    }
  }
}

customElements.define('online-status', OnlineStatus);
