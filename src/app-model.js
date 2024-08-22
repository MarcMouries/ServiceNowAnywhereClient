// src/app-model.js
import { EventEmitter } from './EventEmitter';
import { 
  EVENT_SYS_AUTHENTICATED_USER, 
  EVENT_SYS_FETCHED_USER_APPS,  
  EVENT_SYS_FETCHED_USER_TABLES, 
  EVENT_RECORD_LIST_UPDATED 
} from './EventTypes';

export class Model {
  constructor() {
    this.user = null;
    this.userAppsList = [];          // contains the list of apps the user has access to
    this.userTablesList = [];        // contains the list of tables from a specific app the user has access to
    this.userTableRecordList = {};   // contains the list of records for a specific table
  }

  // Set and get user information
  setUser(user) {
    this.user = user;
    EventEmitter.emit(EVENT_SYS_AUTHENTICATED_USER, user);
  }

  getUser() {
    return this.user;
  }

  // Set and get the list of apps the user has access to
  setUserAppsList(userAppsList) {
    this.userAppsList = userAppsList;
    EventEmitter.emit(EVENT_SYS_FETCHED_USER_APPS, userAppsList);
  }

  getUserAppsList() {
    return this.userAppsList;
  }

  // Set and get the list of tables from a specific app the user has access to
  setUserTablesList(appName, tableList) {
    this.userTablesList = { appName, tables: tableList };
    EventEmitter.emit(EVENT_SYS_FETCHED_USER_TABLES, { appName, tableList });
  }

  getUserTablesList() {
    return this.userTablesList;
  }

  // Set and get the list of records for a specific table
  setUserTableRecordList(tableName, records) {
    this.userTableRecordList[tableName] = records;
    EventEmitter.emit(EVENT_RECORD_LIST_UPDATED, { tableName, records });
  }

  getUserTableRecordList(tableName) {
    return this.userTableRecordList[tableName] || [];
  }
}

export default new Model();
