// src/datasource/NowDataSource.js
import { DataSource } from "../DataSource";
import { EventEmitter } from "../EventEmitter";
import { EVENT_SYS_AUTHENTICATED_USER, EVENT_AUTH_FAILED, EVENT_SYS_FETCHED_USER_APPS } from "../EventTypes";

export class NowDataSource extends DataSource {
  
  async authenticateUser(username, password) {
    console.log("Using NowDataSource data source for authentication");

    try {
      const { serviceNowUrl } = window.NOW_ANYWHERE;

      const credentials = btoa(`${username}:${password}`);
      const table = "sys_user";
      const sysparm_fields = "name,email,sys_id";
      const sysparm_limit = 1;

      const url = `${serviceNowUrl}/api/now/table/${table}?sysparm_query=user_name=${username}&sysparm_fields=${encodeURIComponent(sysparm_fields)}&sysparm_limit=${sysparm_limit}`;
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
    console.log(`Fetching apps the user has access`);
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("user:", user);
    const { username, authToken } = user;
    console.log(`Fetching apps the user ${username} has access`);
    
    const serviceNowUrl = localStorage.getItem("serviceNowUrl");
    console.log("serviceNowUrl:", serviceNowUrl);

    try {
        // Construct the URL for the GetUserAppsAccess API
        const url = `${serviceNowUrl}/api/x_omni_server/useraccessservice/user-apps-access?username=${username}`;
        console.log("Fetching user apps with URL:", url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Basic ${authToken}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("data received = ", data);

            // Check if the data contains the expected result array
            if (data && data.result && Array.isArray(data.result)) {
                const applicationList = data.result.map(app => app.appName);
                console.log("Fetched applications:", applicationList);

                // Emit the fetched user apps event
                EventEmitter.emit(EVENT_SYS_FETCHED_USER_APPS, applicationList);
                return applicationList;
            } else {
                console.error("Unexpected data format:", data);
                document.getElementById("error-msg").textContent = `Unexpected data format received.`;
                return [];
            }
        } else {
            const errorText = await response.text();
            console.error("Failed to fetch user apps:", errorText);
            document.getElementById("error-msg").textContent = `Failed to fetch user apps: ${errorText}`;
            return [];
        }
    } catch (error) {
        console.error("Error fetching user apps:", error);
        const errorMsg = document.getElementById("error-msg");
        if (errorMsg) {
            errorMsg.textContent = `Error: ${error.message}`;
        } else {
            console.error("Error element not found in DOM.");
        }
        return [];
    }
}


  async fetchUserTables(appScope) {
    console.log(`Fetching tables for app scope ${appScope}`);

    try {
      const { servicenowUrl, user: storedUser } = window.NOW_ANYWHERE;
      const credentials = storedUser.authToken;

      // Construct the URL for the GetUserTablesAccess API
      const url = `${servicenowUrl}/api/x_omni_server/useraccessservice/user-tables-access?username=${storedUser.name}&app_scope=${appScope}`;
      console.log("Fetching user tables with URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched tables:", data);
        return data;
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch user tables:", errorText);
        document.getElementById("error-msg").textContent = `Failed to fetch user tables: ${errorText}`;
        return [];
      }
    } catch (error) {
      console.error("Error fetching user tables:", error);
      document.getElementById("error-msg").textContent = `Error: ${error.message}`;
      return [];
    }
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
