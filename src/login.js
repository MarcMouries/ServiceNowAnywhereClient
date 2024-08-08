// src/login.js
import { dataService } from "./DataService";
import { LOG_STYLE } from './LogStyles';
import { EVENT_AUTH_FAILED } from './EventTypes';
import { EventEmitter } from './EventEmitter';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('%c⑪ DOM Content Loaded', LOG_STYLE);
  const loginButton = document.getElementById('login_button');
  if (loginButton) {
    loginButton.addEventListener('click', async (e) => {
      e.preventDefault();
      console.log('%c⑫ User clicked on log in', LOG_STYLE);
      const username = document.getElementById('user_name').value;
      const password = document.getElementById('user_password').value;
      //await authenticateUser(username, password);
      await dataService.authenticateUser(username, password);
    });

    document.getElementById("mask_icon").addEventListener("click", function (e) {
      e.preventDefault();
      const passwordField = document.getElementById("user_password");
      const icon = this.querySelector("i");
      const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);

      if (type === "password") {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      } else {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    });
  }

  EventEmitter.on(EVENT_AUTH_FAILED, (message) => {
    document.getElementById('error-msg').textContent = message;
  });
});
