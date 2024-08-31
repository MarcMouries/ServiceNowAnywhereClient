// src/datasource/mockDataSource.js
import { DataSource } from '../DataSource';
import { EventEmitter } from '../EventEmitter';
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS } from '../EventTypes';

export class MockDataSource extends DataSource {

  async authenticateUser(username, password) {
    console.log('Using mock data source for authentication');
    const user = {
      name: 'Mock User',
      email: 'mock@example.com',
      sys_id: 'mock-sys-id',
      authToken: 'mock-token'
    };

    window.OMNI.user = user;
    localStorage.setItem('user', JSON.stringify(user));
    EventEmitter.emit(EVENT_SYS_AUTHENTICATED_USER, user);
  }

  async fetchUserApps(userSysId) {
    console.log(`Fetching mock apps for user ${userSysId}`);
    const applicationList = ["Inspections", "Expenses"];
    return applicationList;
  }

  async fetchTablesForApp(appName) {
    throw new Error('fetchTablesForApp method not implemented in MOCK');
  }

  async fetchData(appName) {
    console.log(`Fetching mock data for ${appName}`);
    const data = {
      Inspections: {
        fields: ["Inspector", "Updated", "Status"],
        records: [
          { Inspector: 'Alexander Hip', Updated: '6/30/24', Status: 'Complete' },
          { Inspector: 'Christina Weir', Updated: '7/27/24', Status: 'Pending' },
          { Inspector: 'Paul Jones', Updated: '7/28/24', Status: 'Pending' },
          { Inspector: 'Li Wei', Updated: '7/30/24', Status: 'Pending' }
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
    return data[appName] || { fields: [], records: [] };
  }
}
