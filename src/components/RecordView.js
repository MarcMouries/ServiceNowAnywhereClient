// RecordView.js
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
            box-sizing: border-box; /* Ensures padding is included in the height */

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

        input:focus,
        textarea:focus,
        select:focus {
            border-color: var(--input-focus-border);
            outline: none;
            box-shadow: 0 0 5px var(--input-focus-border);
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        input, textarea, select {
          border: 1px solid var(--table-border);
          border-radius: 5px;
          background-color: var(--off-white);
          font-size: 0.9rem;
          height: 36px;
          padding: 6px 8px;
          box-sizing: border-box;
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
      const formGroup = document.createElement("div");
      formGroup.classList.add("form-group");

      const label = document.createElement("label");
      label.textContent = field.label;

      const input = this.createInput(field, recordData.record[field.name] || "");

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

  createInput(field, value) {
    let input;

    if (field.type === "reference" || field.type === "choice") {
      input = this.createSelect(field, value);
    } else {
      input = document.createElement(field.type === "textarea" ? "textarea" : "input");
      input.type = this.getFieldType(field);
      input.value = value;

      // datetime-local input formatting
      if (field.type === "calendar_date_time" && value) {
        // Convert the value to 'YYYY-MM-DDTHH:MM:SS' by replacing the space with 'T'
        input.value = value.replace(' ', 'T');

      }
    }

    return input;
  }

  createSelect(field, value) {
    const select = document.createElement("select");
    select.name = field.name;

    const options = field.type === "reference" ? field.reference_values : field.choices;

    // Populate the select dropdown with options
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = field.type === "reference" ? option.sys_id : option.value;
      opt.textContent = field.type === "reference" ? option.display_value : option.label;

      if (opt.value === value) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    return select;
  }

  getFieldType(field) {
    const typeMap = {
      string: "text", // Short text
      integer: "number", // Integer
      text: "textarea", // Multi-line text
      boolean: "checkbox", // Checkbox
      calendar_date_time: "datetime-local", // Date and time
      glide_date: "date", // Date only
      glide_time: "time", // Time only
      choice: "select", // Choice/dropdown
      reference: "select", // You can use a custom implementation or dropdown for reference fields
      decimal: "number", // Decimal
      currency: "text", // Text (need to add formatting)
      email: "email", // Email
      phone_number: "tel", // Phone number
      url: "url", // URL
      password: "password", // Password field
      glide_duration: "text", // Duration
    };
    return typeMap[field.type] || "text";
  }

  handleInputChange(e) {
    const { name, value } = e.target;

    // Check if the input value is different from the original data
    if (this.originalData[name] !== value) {
      this.changedData[name] = value;
      this.isDirty = true;
    } else {
      delete this.changedData[name];
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
