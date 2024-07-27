class AppContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const content = document.createElement('div');
    content.setAttribute('class', 'content');
    this.shadowRoot.appendChild(content);

    const style = document.createElement('style');
    style.textContent = `
      .content {
        padding: 20px;
        font-size: 16px;
        line-height: 1.5;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header-row h2 {
        margin: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        padding: 10px;
        border: 1px solid #ddd;
      }
      th {
        background-color: #f4f4f4;
      }
      .content button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  setContent(appName, data) {
    const contentDiv = this.shadowRoot.querySelector('.content');
    let tableHeaders = data.fields.map(field => `<th>${field}</th>`).join('');
    let tableRows = data.records.map(record => `
      <tr>
        ${data.fields.map(field => `<td>${record[field]}</td>`).join('')}
      </tr>
    `).join('');

    contentDiv.innerHTML = `
      <div class="header-row">
        <h2>${appName}</h2>
        <button>Add ${appName}</button>
      </div>
      <table>
        <thead>
          <tr>
            ${tableHeaders}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;
  }
}

customElements.define('app-content', AppContent);
