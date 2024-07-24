const { invoke } = window.__TAURI__.core;

window.NOW_ANYWHERE = {};

async function loadEnvVars() {
  const [clientId, clientSecret, redirectUri, servicenowUrl, username, password]
   = await invoke('get_env_vars');

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

  await loadEnvVars();
  const envVars = window.NOW_ANYWHERE;
  document.getElementById('user_name').value = envVars.username || '';
  document.getElementById('user_password').value = envVars.password || '';

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  if (code) {
    fetchToken(code);
  }

  document.getElementById('login_button_1').addEventListener('click', (e) => {
    e.preventDefault();
    greet();
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
});
