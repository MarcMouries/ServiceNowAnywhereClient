// src/app-model.js
import { EventEmitter } from './EventEmitter';
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_SYS_FETCHED_USER_APPS,  EVENT_RECORD_LIST_UPDATED} from './EventTypes';

export class Model {
  constructor() {
    this.user = null;
    this.itemList = [];
    this.itemRecordList = {};  }

  setUser(user) {
    this.user = user;
    EventEmitter.emit(EVENT_SYS_AUTHENTICATED_USER, user);
  }

  setItemList(itemList) {
    this.itemList = itemList;
    EventEmitter.emit(EVENT_SYS_FETCHED_USER_APPS, itemList);
  }

  setItemRecordList(itemName, records) {
    this.itemRecordList[itemName] = records;
    EventEmitter.emit(EVENT_RECORD_LIST_UPDATED, { itemName, records });
  }

  getUser() {
    return this.user;
  }

  getItemList() {
    return this.itemList;
  }
  getItemRecordList() {
    return this.itemRecordList;
  }
}

export default new Model();
