// src/app-controller.js
import { Model } from "./app-model";
//import { authenticateUser, fetchUserApps, fetchData } from "./DataSource";
import { dataService } from './DataService2';
import { MockDataSource } from './datasource/mockDataSource';

import { LOG_STYLE } from "./LogStyles";
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS, 
  EVENT_USER_CLICKED_ON_APP, EVENT_USER_CLICKED_RECORD_ROW, EVENT_USER_CLICKED_NEW_RECORD_BUTTON } from './EventTypes';
import { EventEmitter } from "./EventEmitter";

const model = new Model();

const isMock = true;

if (isMock) {
  dataService.setDataSource(new MockDataSource());
  console.log('dataService......:', dataService);

}

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
  const itemList = await dataService.fetchUserApps(user.sys_id);
  console.log(`%c⑥ Apps fetched for user: ${user.name} = ${itemList.join(", ")}`, LOG_STYLE);
  model.setItemList(itemList);

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

EventEmitter.on(EVENT_USER_CLICKED_ON_APP, async (dataName) => {
  console.log(`%c⑧ Handling data selection: ${dataName}`, LOG_STYLE);
  const selectedData = await dataService.fetchData(dataName);
  model.setItemRecordList(dataName, selectedData);
});

EventEmitter.on(EVENT_USER_CLICKED_NEW_RECORD_BUTTON, (appName) => {
  console.log(`%cUSER_CLICKED_NEW_RECORD_BUTTON: ${appName}`, 'color: white; background: darkblue;');
});

EventEmitter.on(EVENT_USER_CLICKED_RECORD_ROW, ({ appName, rowIndex }) => {
  console.log(`%cUSER_CLICKED_RECORD_ROW: ${appName}, Row Index: ${rowIndex}`, 'color: white; background: darkblue;');
});
