// src/datasource/NowDataSource.js
import { DataSource } from "../DataSource";
import { EventEmitter } from "../EventEmitter";
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS } from "../EventTypes";

export class NowDataSource extends DataSource {
  async invokeRESTapi(url, authToken) {
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

  getConnectionInfo() {
    const user = JSON.parse(localStorage.getItem("user"));
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");
    const { authToken, username } = user;
    return { serviceNowUrl, authToken, username };
  }

  async authenticateUser(username, password) {
    console.log("Using NowDataSource data source for authentication");

    const { serviceNowUrl } = window.OMNI.config;
    const credentials = btoa(`${username}:${password}`);
    const tableName = "sys_user";
    const sysparm_fields = "sys_id,name,email,avatar";
    const sysparm_limit = 1;

    const url = `${serviceNowUrl}/api/now/table/${tableName}?sysparm_query=user_name=${username}&sysparm_fields=${encodeURIComponent(sysparm_fields)}&sysparm_limit=${sysparm_limit}`;
    console.log("url", url);

    const response = await this.invokeRESTapi(url, credentials);
    if (response && response.result && response.result.length > 0) {
      const result = response.result[0];

      //https://marco.service-now.com/5dbec626fb641a907b04ff4655efdc76.iix?t=small
      const avatarURL = `${serviceNowUrl}/${result.avatar}.iix?t=small`;

      const user = {
        name: result.name,
        username: username,
        email: result.email,
        sys_id: result.sys_id,
        authToken: credentials,
        avatarURL: avatarURL
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
    const { serviceNowUrl, authToken, username } = this.getConnectionInfo();
    const url = `${serviceNowUrl}/api/x_omni_server/service/user-apps-access?username=${username}`;
    console.log("Fetching user apps with URL:", url);

    const response = await this.invokeRESTapi(url, authToken);
    if (response && response.result && Array.isArray(response.result)) {
      console.log("Fetched applications:", response.result);
      return response.result;
    } else {
      console.error("Unexpected data format or no apps found");
      return [];
    }
  }

  async fetchTablesForApp(appScope) {
    console.log(`Fetching tables for app scope ${appScope}`);
    const { serviceNowUrl, authToken, username } = this.getConnectionInfo();
    const url = `${serviceNowUrl}/api/x_omni_server/service/user-app-tables-access?username=${username}&app_scope=${appScope}`;
    console.log("Fetching user tables with URL:", url);

    const response = await this.invokeRESTapi(url, authToken);
    if (response && response.result && Array.isArray(response.result)) {
      console.log("Fetched tables:", response.result);
      return response.result;
    } else {
      console.error("Unexpected data format or no tables found");
      return [];
    }
  }

  async fetchListOfRecords(tableName) {
    console.log(`Fetching all records for table: ${tableName}`);
    const { serviceNowUrl, authToken, username } = this.getConnectionInfo();
    // Get table data (schema + records) in a single call
    const url = `${serviceNowUrl}/api/x_omni_server/service/data/${tableName}`;
    const response = await this.invokeRESTapi(url, authToken);
    console.log("Fetched table data:", response);

    return response.result;
  }

  async fetchSingleRecord(tableName, sysId) {
    console.log(`Fetching SingleRecord for table: ${tableName} and sysId ${sysId}`);
    const { serviceNowUrl, authToken, username } = this.getConnectionInfo();
    // Get table data (schema + records) in a single call
    const url = `${serviceNowUrl}/api/x_omni_server/service/data/${tableName}?sys_id=${sysId}`;
    const response = await this.invokeRESTapi(url, authToken);
    console.log("Fetched table data:", response);
    console.log("Fetched table data JSON = " + JSON.stringify(response, null, 2));

    return response.result;
  }

  async updateRecord(table, sysId, data) {
    console.log("NowDataSource: updateRecord", table, sysId, data);
    const { serviceNowUrl, authToken, username } = this.getConnectionInfo();
    throw console.error("updateRecord method not implemented");
  }
}
