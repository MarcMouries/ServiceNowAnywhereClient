// src/app-controller.js
import { Model } from "./app-model";
import { dataService } from "./DataService";
import { MockDataSource } from "./datasource/mockDataSource";
import { NowDataSource } from "./datasource/NowDataSource";
import { LOG_STYLE } from "./LogStyles";
import {
  EVENT_AUTH_FAILED,
  EVENT_SYS_AUTHENTICATED_USER,
  EVENT_SYS_FETCHED_USER_APPS,
  EVENT_SYS_FETCHED_USER_TABLES,
  EVENT_USER_CLICKED_ON_APP,
  EVENT_USER_CLICKED_ON_TABLE,
  EVENT_USER_CLICKED_RECORD,
  EVENT_USER_CLICKED_SAVE_BUTTON,
  EVENT_USER_CLICKED_NEW_RECORD,
  EVENT_SYS_FETCHED_SINGLE_RECORD,
} from "./EventTypes";
import { EventEmitter } from "./EventEmitter";

// Singleton AppController Class
class AppController {
  constructor() {
    if (AppController.instance) {
      return AppController.instance;
    }

    // Initialize once
    this.model = this.initializeModel();
    this.initializeDataSource();
    this.initializeEventListeners();

    AppController.instance = this;
  }

    // Initialize the model
    initializeModel() {
      window.OMNI = window.OMNI || {};
      window.OMNI.model = new Model();
      return window.OMNI.model;
    }

  // Initialize the data source
  initializeDataSource() {
    const isMock = false;

    if (isMock) {
      dataService.setDataSource(new MockDataSource());
    } else {
      dataService.setDataSource(new NowDataSource());
    }

    console.log("Data source = ", dataService.dataSource.constructor.name);
  }

  initializeEventListeners() {
    EventEmitter.on(EVENT_SYS_AUTHENTICATED_USER, async (user) => {
      console.log(`%c③ Controller User successfully authenticated: ${JSON.stringify(user)}`, LOG_STYLE);
      console.log("window.OMNI.model");
      console.log(window.OMNI.model);
      const userAppsList = await dataService.fetchUserApps(user.sys_id);
      const appNames = userAppsList.map((app) => app.appName);
      console.log(`%c⑥ Controller: Apps fetched for user: ${user.name} = ${appNames.join(", ")}`, LOG_STYLE);
      this.model.setUserAppsList(userAppsList);


      console.log(`%c⑦ Controller: Current location ${window.location.href}`, LOG_STYLE);
      EventEmitter.emit(EVENT_SYS_FETCHED_USER_APPS, { appList: userAppsList });

      // Redirect to workspace.html
      if (window.location.pathname == "/") {
        console.log(`%c⑦ Controller: Redirect to workspace.html`, LOG_STYLE);
        window.location.href = "./workspace.html";
      }
    });

    EventEmitter.on(EVENT_AUTH_FAILED, (message) => {
      document.getElementById("error-msg").textContent = message;
    });

    EventEmitter.on(EVENT_USER_CLICKED_ON_APP, async (payload) => {
      console.log(`%c⑧ App controller: Handling app selection: ${payload.appName}`, LOG_STYLE);
      const tableList = await dataService.fetchTablesForApp(payload.appScope);
      this.model.setUserTablesList(payload.appScope, tableList);
      EventEmitter.emit(EVENT_SYS_FETCHED_USER_TABLES, { app: payload, tableList });
    });

    EventEmitter.on(EVENT_USER_CLICKED_ON_TABLE, async (payload) => {
      console.log(`%c⑧ App controller: Received EVENT_USER_CLICKED_ON_TABLE: ${payload.table.label}`, LOG_STYLE);
      const tableData = await dataService.fetchListOfRecords(payload.table.name);
      console.log("%c⑧ App controller: Table data: ", tableData);

      this.model.setUserTableRecordList(payload.table.name, tableData);

      EventEmitter.emit("navigate", `/list/${payload.table.name}`, { table: payload.table, tableData });
    });

    EventEmitter.on(EVENT_USER_CLICKED_RECORD, async (payload) => {
      const { table, sysId } = payload;
      console.log(`%cController: USER_CLICKED_RECORD: ${table.name}, sysId: ${sysId}`, "color: white; background: darkblue;");
      const recordData = await dataService.fetchSingleRecord(table.name, sysId);
      console.log(`%cController: fetched record data: `, recordData);
      EventEmitter.emit("navigate", `/record/${payload.table.name}/${sysId}`, { table: payload.table, recordData });
    });

    EventEmitter.on(EVENT_USER_CLICKED_SAVE_BUTTON, async (payload) => {
      console.log("Controller: EVENT_USER_CLICKED_SAVE_BUTTON: ", payload);
      const { table, sysId, data } = payload;
      console.log(`%cController: EVENT_USER_CLICKED_SAVE_BUTTON: ${table.name}, sysId: ${sysId}`, "color: white; background: darkblue;");
      const response = await dataService.updateRecord(table.name, sysId, data);
      console.log("Controller: response: ", response);
    });

    EventEmitter.on(EVENT_USER_CLICKED_NEW_RECORD, async (payload) => {
      console.log("Controller: USER_CLICKED_NEW_RECORD: ", payload);
      const { table, sysId, data } = payload;
      console.log(`%cController: USER_CLICKED_NEW_RECORD: ${table.name}, sysId: ${sysId}`, "color: white; background: darkblue;");
      const recordData = await dataService.fetchSingleRecord(table.name, sysId);
      console.log(`%cController: fetched record data: `, recordData);
      EventEmitter.emit("navigate", `/record/${payload.table.name}/${sysId}`, { table: payload.table, recordData });

    });
  }

  // Public initialization method
  async initializeApp() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.sys_id) {
      window.OMNI.model.setUser(user);
    } else {
      console.error("%c User sys_id not found. Ensure the user is logged in.", LOG_STYLE);
    }
  }
}

// Export the singleton instance
const appController = new AppController();
export default appController;
