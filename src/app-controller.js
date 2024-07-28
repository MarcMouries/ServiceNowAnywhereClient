// src/app-controller.js
import { Model } from "./app-model";
import { authenticateUser, fetchUserApps, fetchData } from "./dataService";
import { LOG_STYLE } from "./LogStyles";
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS, EVENT_USER_CLICKED_ON_APP } from './EventTypes';
import { EventEmitter } from "./EventEmitter";

const model = new Model();

export async function initializeApp() {
  console.log("%c① Initializing App", LOG_STYLE);
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.sys_id) {
    model.setUser(user);
  } else {
    console.error("%c User sys_id not found. Make sure the user is logged in.", LOG_STYLE);
  }
}

EventEmitter.on(EVENT_SYS_AUTHENTICATED_USER, async (user) => {
  console.log(`%c③ User successfully authenticated: ${JSON.stringify(user)}`, LOG_STYLE);
  const itemList = await fetchUserApps(user.sys_id);
  console.log(`%c⑥ Apps fetched for user: ${user.name} = ${itemList.join(", ")}`, LOG_STYLE);
  model.setItemList(itemList);

  // Redirect to workspace.html
  console.log(`%c⑦ Redirect to workspace ??`, LOG_STYLE);
  console.log(`%c⑦ window.location = ${window.location}`, LOG_STYLE);


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
  const selectedData = await fetchData(dataName);
  model.setItemRecordList(dataName, selectedData);
});
