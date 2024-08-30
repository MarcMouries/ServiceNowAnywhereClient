// src/main.js
import { LOG_STYLE } from './LogStyles';

const { invoke } = window.__TAURI__.core;

window.NOW_ANYWHERE = {};

async function initializeApp() {
  console.log('%c⑭ Initializing App', LOG_STYLE);

  const { innerWidth: w, innerHeight: h } = window;
  console.log(`Current window size = ${w} x ${h}`);

  const [redirectUri, serviceNowUrl, username, password]= await invoke('initialize_app');

  //console.log('CLIENT_ID......:', clientId);
  //console.log('CLIENT_SECRET..:', clientSecret);
  console.log('REDIRECT_URI...:', redirectUri);
  console.log('SERVICENOW_URL.:', serviceNowUrl);
  console.log('USERNAME..:', username);
  console.log('PASSWORD..:', password);

  window.NOW_ANYWHERE = { redirectUri, serviceNowUrl, username, password };
  console.log("window.NOW_ANYWHERE ", window.NOW_ANYWHERE);
}

window.addEventListener("DOMContentLoaded", async () => {
  console.log('%c⑮ DOM Content Loaded in main.js', LOG_STYLE);
  await initializeApp();
  const envVars = window.NOW_ANYWHERE;

  // set the username and password for testing
  console.log("set the username and password for testing")
  const usernameInput = document.getElementById('user_name');
  const passwordInput = document.getElementById('user_password');

  if (usernameInput && passwordInput) {
    usernameInput.value = envVars.username || '';
    passwordInput.value = envVars.password || '';

    console.log("envVars.username", envVars.username)

  }
});
