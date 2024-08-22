

class DataService {
  constructor() {
    this.dataSource = null;
  }

  setDataSource(dataSource) {
    this.dataSource = dataSource;
  }

  async authenticateUser(username, password) {
    return this.dataSource.authenticateUser(username, password);
  }

  async fetchUserApps(userSysId) {
    return this.dataSource.fetchUserApps(userSysId);
  }

  async fetchTablesForApp(appName) {
    return this.dataSource.fetchTablesForApp(appName);
  }

  async fetchData(appName) {
    return this.dataSource.fetchData(appName);
  }
}

export const dataService = new DataService();
