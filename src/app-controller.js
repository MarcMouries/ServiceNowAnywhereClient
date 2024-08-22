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
  EVENT_USER_CLICKED_ON_APP,
  EVENT_USER_CLICKED_RECORD_ROW,
  EVENT_USER_CLICKED_NEW_RECORD_BUTTON,
} from "./EventTypes";
import { EventEmitter } from "./EventEmitter";

const model = new Model();

const isMock = false;

if (isMock) {
  dataService.setDataSource(new MockDataSource());
} else {
  dataService.setDataSource(new NowDataSource());
}

console.log("Data source = ", dataService.dataSource.class);

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
  console.log(`%c③ User successfully authenticated: ${JSON.stringify(user)}`, LOG_STYLE);
  const appList = await dataService.fetchUserApps(user.sys_id);
  console.log(`%c⑥ Apps fetched for user: ${user.name} = ${appList.join(", ")}`, LOG_STYLE);
  model.setUserAppsList(appList);

  // Redirect to workspace.html
  console.log(`%c⑦ Current location ${window.location.href}`, LOG_STYLE);

  if (window.location.pathname == "/") {
    console.log(`%c⑦ Redirect to workspace.html`, LOG_STYLE);
    window.location.href = "./workspace.html";
  }
});

EventEmitter.on(EVENT_AUTH_FAILED, (message) => {
  document.getElementById("error-msg").textContent = message;
});

EventEmitter.on(EVENT_USER_CLICKED_ON_APP, async (app) => {
  console.log(`%c⑧ Handling app selection: ${app.appName}`, LOG_STYLE);
  const tableList = await dataService.fetchTablesForApp(app.appScope);
  model.setUserTablesList(app.appScope, tableList);
});

EventEmitter.on(EVENT_USER_CLICKED_NEW_RECORD_BUTTON, (appName) => {
  console.log(`%cUSER_CLICKED_NEW_RECORD_BUTTON: ${appName}`, "color: white; background: darkblue;");
});

EventEmitter.on(EVENT_USER_CLICKED_RECORD_ROW, ({ appName, rowIndex }) => {
  console.log(`%cUSER_CLICKED_RECORD_ROW: ${appName}, Row Index: ${rowIndex}`, "color: white; background: darkblue;");
});
