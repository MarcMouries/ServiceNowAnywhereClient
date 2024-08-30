// src/components/table-content.js
import { EVENT_RECORD_LIST_UPDATED } from "../EventTypes.ts";
import { EVENT_USER_CLICKED_RECORD_ROW, EVENT_USER_CLICKED_NEW_RECORD_BUTTON } from '../EventTypes';
import { EventEmitter } from '../EventEmitter.ts';

const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host {
            font-family: "Poppins", sans-serif !important;
            background-color: var(--content-color);
        }
        .table-container {
            padding: 15px;
            padding-bottom: 20px;
            line-height: 1.5;
            background-color: var(--container-color);
            border-radius: var(--border-radius);
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
            color: var(--table-th-color);
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 0.9rem;
        }
        th {
            background-color: var(--table-th-background);
            border: 1px solid var(--table-border);
            border-radius: 5px;
            color: var(--table-th-color);
            font-size: 0.8rem;
            padding: 10px;
            text-align: left;
            text-transform: uppercase;
          }
        td {
          padding: 10px;
          border: 1px solid var(--table-border);
          text-align: left;
        }
        tr {
          color: var(--table-tr-color);
        }
        tr:hover td {
            border-inline: 1px solid var(--accent-bright);
            cursor: pointer;
        }
        tr:nth-child(even) {
          background-color: var(--table-tr-even);
        }
        /* Apply border-radius to the first column's left border */
        table tr td:first-child {
            border-top-left-radius: 5px;
            border-bottom-left-radius: 5px;
        }

        /* Apply border-radius to the last column's right border */
        table tr td:last-child {
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
        }

        .container button {
            background-color: var(--primary-color);
            border: none;
            border-radius: var(--border-radius);
            color: var(--text-color);
            cursor: pointer;
            font-family: "Poppins", sans-serif !important;
            font-size: 1rem;
            padding: 6px 8px;
        }
    </style>

    <div class="table-container"></div>
`;

class TableContent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        EventEmitter.on(EVENT_RECORD_LIST_UPDATED, ({ tableName, tableData }) => {
          console.log(`%c⑩ TableContent: Updating content for: ${tableName}`, "color: white; background: darkblue;");
          console.log("TableContent: Updating content with tableData: ", tableData);
          this.setContent(tableName, tableData);
        });
    }

    setContent(appName, tableData) {
      console.log("%c⑩ TableContent: setContent for " + appName, tableData);
      console.log( "headers = ", tableData.schema.tableHeader);

        const contentDiv = this.shadowRoot.querySelector(".table-container");

      // fields: "label,description" => fieldsAsCSV
      // create a new field

        let tableHeaders = tableData.schema.tableHeader.map((field) => `<th>${field}</th>`).join("");

        let tableRows = tableData.records.map((record, index) => `
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

customElements.define("table-content", TableContent);
