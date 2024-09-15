// src/components/Avatar.js
class Avatar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.render();
  }

  static get observedAttributes() {
    return ['src', 'name', 'rounded'];
  }

  connectedCallback() {
    if (!this.classList.contains('user-avatar')) {
      this.classList.add('user-avatar');
    }

  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Only re-render if the attribute value has actually changed
    if (oldValue !== newValue) {
      this.render();
    }
  }

  getSizeClass() {
    const size = this.getAttribute('size') || 'md'; // Default to 'md' if size not set
    const sizes = {
      sm: 'width: 24px; height: 24px;',
      md: 'width: 32px; height: 32px;',
      lg: 'width: 40px; height: 40px;',
      xl: 'width: 80px; height: 80px;',
      none: ''
    };
    return sizes[size];
  }

  // Method to extract initials from the name
  getInitials(name) {
    if (!name) return '';
    const names = name.trim().split(' ');
    const initials = names.map(n => n.charAt(0)).slice(0, 2).join('');
    return initials.toUpperCase();
  }

  render() {
    // Clear the shadow root
    this.shadowRoot.innerHTML = '';

    // Get attributes
    const imgSrc = this.getAttribute('src');
    const name = this.getAttribute('name') || '';
    const alt = name || 'User Avatar';
    const rounded = true;//this.hasAttribute('rounded');

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.setAttribute('class', 'avatar-wrapper');

    // Apply styles
    const style = document.createElement('style');
    style.textContent = `
      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ccc;
        color: #fff;
        font-weight: 400;
        font-size: 16px;
        overflow: hidden;
        ${rounded ? 'border-radius: 50%;' : ''}
        ${this.getSizeClass()} 
      }
      .avatar-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        ${rounded ? 'border-radius: 50%;' : ''}
      }
      .avatar-wrapper svg {
        width: 60%;
        height: 60%;
        fill: currentColor;
      }
    `;

    // Determine content to display
    if (imgSrc) {
      // Display the image
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = alt;
      wrapper.appendChild(img);
    } else if (name) {
      // Display initials
      wrapper.textContent = this.getInitials(name);
    } else {
      // Display default SVG icon
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.innerHTML = `
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5S7 4.24 7 7s2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
      `;
      wrapper.appendChild(svg);
    }

    // Append elements to the shadow DOM
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(wrapper);
  }
}

// Define the custom element
customElements.define('user-avatar', Avatar);
