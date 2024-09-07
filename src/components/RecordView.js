import { EventEmitter } from "../EventEmitter.ts";
import { EVENT_USER_CLICKED_SAVE_BUTTON } from "../EventTypes";
import { EVENT_SYS_FETCHED_SINGLE_RECORD } from "../EventTypes";

const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            background-color: var(--content-color);
            font-family: "Poppins", sans-serif !important;
            width: 100%;
            padding: 10px;
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
          transition: background-color 0.2s ease, color 0.2s ease;
      }
      
      .actions button:disabled {
          background-color: var(--disabled-bg-color, #b0b0b0); /* Default disabled color */
          color: var(--disabled-text-color, #ffffff); /* Default disabled text color */
          cursor: not-allowed;
          opacity: 0.6;
      }
      
        .form-container {
            padding: 15px;
            padding-bottom: 20px;
            line-height: 1.5;
            background-color: var(--container-color);
            border-radius: var(--border-radius);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .form-group {
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding-bottom: 5px;
        }
        label {
            font-size: 0.9rem;
            font-weight: bold;
            color: var(--table-th-color);
        }
        input:active {
          border-color: red;
        }
        input, textarea, select {
            padding: 8px;
            font-size: 0.9rem;
            border: 1px solid var(--table-border);
            border-radius: 5px;
            background-color: var(--off-white);
        }
        button {
            margin-top: 15px;
            padding: 8px 12px;
            background-color: var(--primary-color);
            color: var(--text-color);
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
        }
    </style>
    <div class="form-container"></div>
`;

class RecordView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.tableName = null;
    this.recordData = null;
    this.originalData = null;
    this.isDirty = false;
    this.changedData = {};
    this.formContainer = this.shadowRoot.querySelector(".form-container");
  }

  connectedCallback() {
    console.log("RecordView component connected to the DOM");
    EventEmitter.on(EVENT_SYS_FETCHED_SINGLE_RECORD, (payload) => {
      console.log("RecordView received payload: ", payload);
      this.displayRecord(payload.table, payload.recordData);
    });
  }

  displayRecord(table, recordData) {
    if (!recordData || !recordData.record || !recordData.record.sys_id) {
      console.error("No record data or sys_id received to display.");
      return;
    }

    this.table = table;
    this.sysId = recordData.record.sys_id;
    this.originalData = { ...recordData.record }; // Clone original data

    // Clear existing content in the form container
    this.formContainer.innerHTML = "";

    // Create header and save button
    const headerRow = document.createElement("div");
    headerRow.classList.add("header-row");
    headerRow.innerHTML = `
        <h2>${table.label}</h2> 
        <div class="actions">
            <button id="save_record" disabled>Save</button>
        </div>
    `;
    this.formContainer.appendChild(headerRow);

    const form = document.createElement("form");
    const builtForm = this.buildForm(table, recordData);
    form.appendChild(builtForm);
    this.formContainer.appendChild(form);

    // Add event listener for the save button
    this.shadowRoot.querySelector("#save_record").addEventListener("click", (e) => {
      e.preventDefault();
      this.handleSave();
    });
  }

  buildForm(table, recordData) {
    const fragment = document.createDocumentFragment();

    // Build and append form fields
    recordData.schema.forEach((field) => {
      const fieldType = this.getFieldType(field);
      const formGroup = document.createElement("div");
      formGroup.classList.add("form-group");

      const label = document.createElement("label");
      label.textContent = field.label;

      const input = this.createInput(field.name, fieldType, recordData.record[field.name] || "");
      
      // Listen for input changes to detect dirty state
      input.addEventListener("input", (e) => {
        this.handleInputChange(e);
      });

      formGroup.appendChild(label);
      formGroup.appendChild(input);
      fragment.appendChild(formGroup);
    });

    return fragment;
  }

  createInput(name, type, value) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    input.value = value;
    return input;
  }

  getFieldType(field) {
    const typeMap = {
      string: "text",
      integer: "number",
      text: "textarea",
      boolean: "checkbox",
      // Add more mappings as needed
    };
    return typeMap[field.type] || "text";
  }

  handleInputChange(e) {
    const { name, value } = e.target;

    // Check if the input value is different from the original data
    if (this.originalData[name] !== value) {
      this.changedData[name] = value; // Store changed data
      this.isDirty = true;
    } else {
      delete this.changedData[name]; // Remove from changed data if reverted
      this.isDirty = Object.keys(this.changedData).length > 0;
    }

    // Enable or disable the Save button based on dirty state
    this.shadowRoot.querySelector("#save_record").disabled = !this.isDirty;
  }

  handleSave() {
    console.log("RecordView: handle save (only changed data): ", this.changedData);

    EventEmitter.emit(EVENT_USER_CLICKED_SAVE_BUTTON, {
      table: this.table,
      sysId: this.sysId,
      data: this.changedData
    });

    // Reset dirty state after save
    this.isDirty = false;
    this.changedData = {};
    this.shadowRoot.querySelector("#save_record").disabled = true;
  }
}

customElements.define("record-view", RecordView);
