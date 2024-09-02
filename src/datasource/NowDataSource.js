// src/datasource/NowDataSource.js
import { DataSource } from "../DataSource";
import { EventEmitter } from "../EventEmitter";
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS } from "../EventTypes";

export class NowDataSource extends DataSource {
  async fetchData(url, authToken) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${authToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        console.error("Request failed:", errorText);
        document.getElementById("error-msg").textContent = `Request failed: ${errorText}`;
        return null;
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      document.getElementById("error-msg").textContent = `Error: ${error.message}`;
      return null;
    }
  }

  async authenticateUser(username, password) {
    console.log("Using NowDataSource data source for authentication");

    const { serviceNowUrl } = window.OMNI.config;
    const credentials = btoa(`${username}:${password}`);
    const tableName = "sys_user";
    const sysparm_fields = "name,email,sys_id";
    const sysparm_limit = 1;

    const url = `${serviceNowUrl}/api/now/table/${tableName}?sysparm_query=user_name=${username}&sysparm_fields=${encodeURIComponent(sysparm_fields)}&sysparm_limit=${sysparm_limit}`;
    console.log("url", url);

    const data = await this.fetchData(url, credentials);
    if (data && data.result && data.result.length > 0) {
      const user = {
        name: data.result[0].name,
        username: username,
        email: data.result[0].email,
        sys_id: data.result[0].sys_id,
        authToken: credentials,
      };
      console.log("User data:", user);

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("serviceNowUrl", serviceNowUrl);

      EventEmitter.emit(EVENT_SYS_AUTHENTICATED_USER, user);
    } else {
      EventEmitter.emit(EVENT_AUTH_FAILED, "Could not authenticate " + username);
    }
  }

  async fetchUserApps() {
    console.log("Fetching apps the user has access to");
    const user = JSON.parse(localStorage.getItem("user"));
    const { username, authToken } = user;
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");
    const url = `${serviceNowUrl}/api/x_omni_server/service/user-apps-access?username=${username}`;
    console.log("Fetching user apps with URL:", url);

    const data = await this.fetchData(url, authToken);
    if (data && data.result && Array.isArray(data.result)) {
      console.log("Fetched applications:", data.result);
      return data.result;
    } else {
      console.error("Unexpected data format or no apps found");
      return [];
    }
  }

  async fetchTablesForApp(appScope) {
    console.log(`Fetching tables for app scope ${appScope}`);
    const user = JSON.parse(localStorage.getItem("user"));
    const { username, authToken } = user;
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");
    const url = `${serviceNowUrl}/api/x_omni_server/service/user-app-tables-access?username=${username}&app_scope=${appScope}`;
    console.log("Fetching user tables with URL:", url);

    const data = await this.fetchData(url, authToken);
    if (data && data.result && Array.isArray(data.result)) {
      console.log("Fetched tables:", data.result);
      return data.result;
    } else {
      console.error("Unexpected data format or no tables found");
      return [];
    }
  }

  async fetchListOfRecords(tableName) {
    console.log(`Fetching all records for table: ${tableName}`);

    const user = JSON.parse(localStorage.getItem("user"));
    const { authToken } = user;
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");

    // Get table data (schema + records) in a single call
    const urlTableData = `${serviceNowUrl}/api/x_omni_server/service/data/${tableName}`;
    const tableData = await this.fetchData(urlTableData, authToken);
    console.log("Fetched table data:", tableData);

    return tableData.result;
  }

  async fetchSingleRecord(tableName, sysId) {
    console.log(`Fetching SingleRecord for table: ${tableName} and sysId ${sysId}`);

    const user = JSON.parse(localStorage.getItem("user"));
    const { authToken } = user;
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");

    // Get table data (schema + records) in a single call
    const urlTableData = `${serviceNowUrl}/api/x_omni_server/service/data/${tableName}?sys_id=${sysId}`;
    const tableData = await this.fetchData(urlTableData, authToken);
    console.log("Fetched table data:", tableData);

    return tableData.result;
  }
  
}
