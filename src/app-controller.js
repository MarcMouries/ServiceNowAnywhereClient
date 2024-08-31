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
  EVENT_RECORD_LIST_UPDATED,
  EVENT_USER_CLICKED_RECORD_ROW,
  EVENT_USER_CLICKED_NEW_RECORD_BUTTON,
} from "./EventTypes";
import { EventEmitter } from "./EventEmitter";

// Initialize the global namespace if it doesn't exist
window.OMNI = window.OMNI || {};

// Initialize the model and set it to the global namespace
window.OMNI.model = new Model();

const model = window.OMNI.model;  // Use the globally accessible model

console.log("window.OMNI.model");
console.log(window.OMNI.model);

const isMock = false;

if (isMock) {
  dataService.setDataSource(new MockDataSource());
} else {
  dataService.setDataSource(new NowDataSource());
}

console.log("Data source = ", dataService.dataSource.constructor.name);

export async function initializeApp() {
  console.log("%c① ① Initializing App", LOG_STYLE);
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.sys_id) {
    model.setUser(user);
  } else {
    console.error("%c User sys_id not found. Make sure the user is logged in.", LOG_STYLE);
  }
}

EventEmitter.on(EVENT_SYS_AUTHENTICATED_USER, async (user) => {
  console.log(`%c③ Controller User successfully authenticated: ${JSON.stringify(user)}`, LOG_STYLE);
  const userAppsList = await dataService.fetchUserApps(user.sys_id);
  const appNames = userAppsList.map((app) => app.appName);
  console.log(`%c⑥ Controller: Apps fetched for user: ${user.name} = ${appNames.join(", ")}`, LOG_STYLE);
  model.setUserAppsList(userAppsList);
  console.log("window.OMNI.model");
console.log(window.OMNI.model);

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
  model.setUserTablesList(payload.appScope, tableList);
  EventEmitter.emit(EVENT_SYS_FETCHED_USER_TABLES, { app: payload, tableList });
});

EventEmitter.on(EVENT_USER_CLICKED_ON_TABLE, async (payload) => {
  console.log(`%c⑧ App controller: Handling Table Selection: ${payload.table.label}`, LOG_STYLE);
  const tableData = await dataService.fetchRecordsForTable(payload.table.name);
  model.setUserTableRecordList(payload.table.name, tableData);
  EventEmitter.emit(EVENT_RECORD_LIST_UPDATED, { table: payload.table, tableData });
});

EventEmitter.on(EVENT_USER_CLICKED_NEW_RECORD_BUTTON, (appName) => {
  console.log(`%cUSER_CLICKED_NEW_RECORD_BUTTON: ${appName}`, "color: white; background: darkblue;");
});

EventEmitter.on(EVENT_USER_CLICKED_RECORD_ROW, ({ appName, rowIndex }) => {
  console.log(`%cUSER_CLICKED_RECORD_ROW: ${appName}, Row Index: ${rowIndex}`, "color: white; background: darkblue;");
});
