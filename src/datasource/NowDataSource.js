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

    const { serviceNowUrl } = window.NOW_ANYWHERE;
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
    }
    else {
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

  async fetchRecordsForTable(tableName) {
    console.log(`Fetching records for table ${tableName}`);

    const user = JSON.parse(localStorage.getItem("user"));
    const { username, authToken } = user;
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");

    // get table schema
    const urlTableSchema = `${serviceNowUrl}/api/x_omni_server/service/table-schema?table_name=${tableName}`;

    const tableSchema = await this.fetchData(urlTableSchema, authToken);
    console.log("tableSchema", tableSchema)

    // get the list of records with the necessary fields per the list view.
    const sysparm_fields = tableSchema.result.fields;

    const url = `${serviceNowUrl}/api/now/table/${tableName}?sysparm_fields=${encodeURIComponent(sysparm_fields)}`;

    console.log(`url = ${url}`);

    const data = await this.fetchData(url, authToken);
    if (data && data.result && Array.isArray(data.result)) {
      console.log("Fetched records:", data.result);
      return data.result;
    } else {
      console.error("Unexpected data format or no records found");
      return [];
    }
  }
}