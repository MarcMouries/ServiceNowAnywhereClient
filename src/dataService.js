// src/dataService.js
import { EventEmitter } from './EventEmitter';
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS } from './EventTypes';
import { LOG_STYLE } from './LogStyles';

export async function authenticateUser(username, password) {
  console.log('%c② App connecting to ServiceNow to authenticate the user', LOG_STYLE);
  const credentials = btoa(`${username}:${password}`);
  
  try {
    const { servicenowUrl } = window.NOW_ANYWHERE;
    const url = `${servicenowUrl}/api/now/table/sys_user?sysparm_query=user_name=${username}&sysparm_fields=name,email,sys_id&sysparm_limit=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const user = {
        name: data.result[0].name,
        email: data.result[0].email,
        sys_id: data.result[0].sys_id,
        authToken: credentials
      };

      window.NOW_ANYWHERE.user = user;
      localStorage.setItem('user', JSON.stringify(user));
      console.log(`%c③ User successfully authenticated: ${JSON.stringify(user)}`, LOG_STYLE);
      EventEmitter.emit(EVENT_SYS_AUTHENTICATED_USER, user);
    } else {
      const errorText = await response.text();
      EventEmitter.emit(EVENT_AUTH_FAILED, `Login failed: ${errorText}`);
    }
  } catch (error) {
    EventEmitter.emit(EVENT_AUTH_FAILED, `Error: ${error.message}`);
  }
}

export async function fetchUserApps(userSysId) {
  console.log(`%c⑤ Fetching Apps for user ${userSysId}`, LOG_STYLE);
  const applicationList = ["Inspection", "Expenses"];
  console.log(`%c⑥ User Apps fetched for ${userSysId}: ${applicationList.join(', ')}`, LOG_STYLE);
  EventEmitter.emit(EVENT_SYS_FETCHED_USER_APPS, applicationList);
  return applicationList;
}

export async function fetchData(appName) {
  console.log(`%c⑧ Fetching Data for ${appName}`, LOG_STYLE);
  const data = {
    Inspection: {
      fields: ["Inspector", "Location", "Status"],
      records: [
        { Inspector: 'Alexander Hip', Location: 'London', Status: 'Complete' },
        { Inspector: 'Christina Weir', Location: 'New York', Status: 'Pending' }
      ]
    },
    Expenses: {
      fields: ["Employee", "Amount", "Date", "Category"],
      records: [
        { Employee: 'Courtney Cook', Amount: '$200', Date: '2024-07-20', Category: 'Travel' },
        { Employee: 'Syunren Tomono', Amount: '$150', Date: '2024-07-18', Category: 'Meals' }
      ]
    }
  };
  console.log(`%c⑧ Data fetched for ${appName}`, LOG_STYLE);
  return data[appName] || { fields: [], records: [] };
}
