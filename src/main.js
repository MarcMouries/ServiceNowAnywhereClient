// src/main.js
import { LOG_STYLE } from './LogStyles';

const { invoke } = window.__TAURI__.core;

window.NOW_ANYWHERE = {};

async function initializeApp() {
  console.log('%c⑭ Initializing App', LOG_STYLE);
  const [clientId, clientSecret, redirectUri, servicenowUrl, username, password]
    = await invoke('initialize_app');

  console.log('CLIENT_ID......:', clientId);
  console.log('CLIENT_SECRET..:', clientSecret);
  console.log('REDIRECT_URI...:', redirectUri);
  console.log('SERVICENOW_URL.:', servicenowUrl);
  console.log('USERNAME..:', username);
  console.log('PASSWORD..:', password);

  window.NOW_ANYWHERE = { clientId, clientSecret, redirectUri, servicenowUrl, username, password };
}

async function fetchToken(code) {
  try {
    const { clientId, clientSecret, redirectUri } = await getEnvVars();
    
    const response = await fetch('https://your-instance.service-now.com/oauth_token.do', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'authorization_code',
        'client_id': clientId,
        'client_secret': clientSecret,
        'code': code,
        'redirect_uri': redirectUri
      })
    });

    const data = await response.json();
    localStorage.setItem('authToken', data.access_token);
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Error fetching token:', error);
    alert('Failed to authenticate: ' + error.message);
  }
}

async function greet() {
  const errorMsgEl = document.querySelector("#error-msg");
  const greetInputEl = document.querySelector("#user_name");
  errorMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", async () => {
  console.log('%c⑮ DOM Content Loaded in main.js', LOG_STYLE);
  await initializeApp();
  const envVars = window.NOW_ANYWHERE;

  const usernameInput = document.getElementById('user_name');
  const passwordInput = document.getElementById('user_password');

  if (usernameInput && passwordInput) {
    usernameInput.value = envVars.username || '';
    passwordInput.value = envVars.password || '';

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      fetchToken(code);
    }
  }
});
