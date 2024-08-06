// src/datasource/NowDataSource.js
import { DataSource } from "../DataSource";
import { EventEmitter } from "../EventEmitter";
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS } from "../EventTypes";

export class NowDataSource extends DataSource {
  async authenticateUser(username, password) {
    console.log("Using NowDataSource data source for authentication");

    try {
      const { servicenowUrl } = window.NOW_ANYWHERE;
      const credentials = btoa(`${username}:${password}`);
      const table = "sys_user";
      const sysparm_fields = "name,email,sys_id";
      const sysparm_limit = 1;

      const url = `${servicenowUrl}/api/now/table/${table}?sysparm_query=user_name=${username}&sysparm_fields=${encodeURIComponent(sysparm_fields)}&sysparm_limit=${sysparm_limit}`;
      console.log("url", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        const user = {
          name: data.result[0].name,
          email: data.result[0].email,
          sys_id: data.result[0].sys_id,
          authToken: credentials,
        };
        console.log("User data:", user);

        // Save to window.NOW_ANYWHERE
        window.NOW_ANYWHERE.user = user;
        localStorage.setItem("user", JSON.stringify(user));
        EventEmitter.emit(EVENT_SYS_AUTHENTICATED_USER, user);
      } else {
        const errorText = await response.text();
        console.error("Login failed:", errorText);
        document.getElementById("error-msg").textContent = `Login failed: ${errorText}`;
      }
    } catch (error) {
      console.error("Error:", error);
      console.error(`Error.message= ${error.message}`);
      if (error instanceof TypeError && error.message.includes("Load failed")) {
        document.getElementById("error-msg").textContent = "Unable to connect to the server. Please check your network connection.";
      } else {
        document.getElementById("error-msg").textContent = `Error: ${error.message}`;
      }
    }
  }

  async fetchUserApps(userSysId) {
    console.log(`Fetching mock apps for user ${userSysId}`);
    const applicationList = ["Inspections", "Expenses"];
    EventEmitter.emit(EVENT_SYS_FETCHED_USER_APPS, applicationList);
    return applicationList;
  }

  async fetchData(appName) {
    console.log(`Fetching mock data for ${appName}`);
    const data = {
      Inspections: {
        fields: ["Inspector", "Updated", "Status"],
        records: [
          { Inspector: "Alexander Hip", Updated: "6/30/24", Status: "Complete" },
          { Inspector: "Christina Weir", Updated: "7/27/24", Status: "Pending" },
          { Inspector: "Paul Jones", Updated: "7/28/24", Status: "Pending" },
          { Inspector: "Li Wei", Updated: "7/30/24", Status: "Pending" },
        ],
      },
      Expenses: {
        fields: ["Employee", "Amount", "Date", "Category"],
        records: [
          { Employee: "Courtney Cook", Amount: "$200", Date: "2024-07-20", Category: "Travel" },
          { Employee: "Syunren Tomono", Amount: "$150", Date: "2024-07-18", Category: "Meals" },
        ],
      },
    };
    return data[appName] || { fields: [], records: [] };
  }
}
