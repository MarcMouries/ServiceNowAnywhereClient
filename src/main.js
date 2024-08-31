// src/main.js
import { LOG_STYLE } from './LogStyles';

const { invoke } = window.__TAURI__.core;

window.OMNI = window.OMNI || {};
window.OMNI.config = window.OMNI.config || {};
window.OMNI.auth = window.OMNI.auth || {};

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

  window.OMNI.config.redirectUri = redirectUri;
  window.OMNI.config.serviceNowUrl = serviceNowUrl;
  window.OMNI.auth.username = username;
  window.OMNI.auth.password = password;


  console.log("window.OMNI ", window.OMNI);
  console.log("window.OMNI ", window.OMNI);
}

window.addEventListener("DOMContentLoaded", async () => {
  console.log('%c⑮ DOM Content Loaded in main.js', LOG_STYLE);
  await initializeApp();
  const authVars = window.OMNI.auth;

  // set the username and password for testing
  console.log("set the username and password for testing")
  const usernameInput = document.getElementById('user_name');
  const passwordInput = document.getElementById('user_password');

  if (usernameInput && passwordInput) {
    usernameInput.value = authVars.username || '';
    passwordInput.value = authVars.password || '';

    console.log("authVars.username", authVars.username)

  }
});
