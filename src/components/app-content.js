// src/components/app-content.js
import { EVENT_RECORD_LIST_UPDATED } from "../EventTypes.ts";
import { EVENT_USER_CLICKED_RECORD_ROW, EVENT_USER_CLICKED_NEW_RECORD_BUTTON } from '../EventTypes';

import { EventEmitter } from "../EventEmitter.ts";

class AppContent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    EventEmitter.on(EVENT_RECORD_LIST_UPDATED, ({ itemName, records }) => {
      console.log(`%c⑩ Updating content for: ${itemName}`, "color: white; background: darkblue;");
      this.setContent(itemName, records);
    });

    const content = document.createElement("div");
    content.setAttribute("class", "content");
    this.shadowRoot.appendChild(content);

    const style = document.createElement("style");
    style.textContent = `

    :host {
      font-family: "Poppins", sans-serif !important;
      font-size: 1rem;
      background-color: #E5E9FE
    }
      .content {
        padding: 20px;
        font-size: 16px;
        line-height: 1.5;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .header-row h2 {
        margin: 0;
        font-size: 1.5em;
        color: #4A47A3;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: left;
      }
      tr:hover {
        background-color:  #f4f4f4;
        cursor: pointer;
      }
      th {
        background-color: #f4f4f4;
        color: #4A47A3;
      }
      .content button {
        background-color: #4A47A3;
        border: none;
        border-radius: 5px;
        color: white;
        cursor: pointer;
        font-family: "Poppins", sans-serif !important;
        font-size: 1rem;
        padding: 6px 8px
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  setContent(appName, data) {
    const contentDiv = this.shadowRoot.querySelector(".content");
    let tableHeaders = data.fields.map((field) => `<th>${field}</th>`).join("");
    let tableRows = data.records
    .map((record, index) => `
        <tr data-index="${index}">
            ${data.fields.map((field) => `<td>${record[field]}</td>`).join("")}
       </tr>`).join("");

       contentDiv.innerHTML = `
       <div class="header-row">
         <h2>${appName}</h2>
         <button id="add_new_record">Add ${appName}</button>
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
 
     // Add event listeners for the button and table rows
     this.shadowRoot.querySelector('#add_new_record').addEventListener('click', () => {
       EventEmitter.emit(EVENT_USER_CLICKED_NEW_RECORD_BUTTON, appName);
     });
 
     this.shadowRoot.querySelectorAll('tbody tr').forEach(row => {
       row.addEventListener('click', () => {
         const rowIndex = row.getAttribute('data-index');
         EventEmitter.emit(EVENT_USER_CLICKED_RECORD_ROW, { appName, rowIndex });
       });
     });
   }
 }
 
 customElements.define("app-content", AppContent);