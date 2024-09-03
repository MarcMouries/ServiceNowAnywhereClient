// src/components/ListView.js
import { EVENT_RECORD_LIST_UPDATED } from "../EventTypes.ts";
import { EVENT_USER_CLICKED_RECORD, EVENT_USER_CLICKED_NEW_RECORD } from "../EventTypes";
import { EventEmitter } from "../EventEmitter.ts";

const template = document.createElement("template");
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
            color: var(--text-dimmed-light);
        }
        .actions {
            display: flex;
            justify-content: flex-end;
            margin-left: auto;
        }
        .actions button {
            background-color: var(--primary-color);
            border: none;
            border-radius: var(--border-radius);
            color: var(--text-color);
            cursor: pointer;
            font-family: "Poppins", sans-serif !important;
            font-size: 1rem;
            padding: 6px 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 0.9rem;
        }
        th {
            background-color: var(--table-th-background);
            border-right: 1px solid var(--table-border);
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
            border: 1px solid transparent;
        }
        tr:hover {
            border-color: var(--accent-bright);
            background-color: var(--table-tr-hover-bg);
            cursor: pointer;
        }
        tr:hover td {
            border-right: 1px solid var(--accent-bright);
        }
        tr:hover td:first-child {
            border-left: 1px solid var(--accent-bright); 
        }
        tr:hover td:last-child {
            border-right: 1px solid var(--accent-bright); 
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
    </style>

    <div class="table-container"></div>
`;

class ListView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    EventEmitter.on(EVENT_RECORD_LIST_UPDATED, (payload) => {
      console.log(`%c⑩ ListView: Updating content for: ${payload.tableName}`, "color: white; background: darkblue;");
      console.log("ListView: Updating content with tableData: ", payload);
      this.setContent(payload.table, payload.tableData);
    });
  }

  setContent(table, tableData) {
    console.log(`%c⑩ ListView: setContent for `, table);
    console.log(`%c⑩ ListView: setContent for ${table.name}`, "color: darkblue;", tableData);

    // Build table headers
    let tableHeaders = tableData.schema.map((column) => `<th>${column.label}</th>`).join("");

    // Build table rows
    let tableRows = tableData.records.map((record, index) => `
        <tr data-index="${index}" data-sys-id="${record.sys_id}">
            ${tableData.schema.map((column) => `<td>${record[column.name] || ""}</td>`).join("")}
        </tr>`).join("");

    // Render the HTML table
    const contentDiv = this.shadowRoot.querySelector(".table-container");
    contentDiv.innerHTML = `
        <div class="header-row">
            <h2>${table.label}</h2> 
            <div class="actions">
                <button id="add_new_record">Add ${table.label}</button>
            </div>
        </div>
        <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
        </table>
      `;

    // Add event listeners for the button and table rows
    this.shadowRoot.querySelector("#add_new_record").addEventListener("click", () => {
      EventEmitter.emit(EVENT_USER_CLICKED_NEW_RECORD, table.name);
    });

    this.shadowRoot.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', () => {
            const sysId = row.getAttribute('data-sys-id');
            EventEmitter.emit(EVENT_USER_CLICKED_RECORD, { table, sysId });
        });
    });
  }
}

customElements.define("list-view", ListView);
