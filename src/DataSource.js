// src/dataSource.js
export class DataSource {
    async authenticateUser(username, password) {
      throw new Error('authenticateUser method not implemented');
    }

    async fetchUserApps(userSysId) {
      throw new Error('fetchUserApps method not implemented');
    }

    async fetchTablesForApp(appName) {
      throw new Error('fetchTablesForApp method not implemented');
    }

    async fetchListOfRecords(tableName) {
      throw new Error('fetchListOfRecords method not implemented');
    }
    async fetchSingleRecord(tableName, sysId) {
      throw new Error('fetchListOfRecords method not implemented');
    }
  }