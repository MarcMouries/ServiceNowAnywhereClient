const { invoke } = window.__TAURI__.core;

async function loginWithBasicAuth(username, password) {
  console.log('loginWithBasicAuth');

  const credentials = btoa(`${username}:${password}`);
  console.log('credentials', credentials);

  try {
    const { servicenowUrl } = window.NOW_ANYWHERE;
    const table = "sys_user";
    const sysparm_fields = "name,email,sys_id";
    const sysparm_limit = 1;

    const url = `${servicenowUrl}/api/now/table/${table}?sysparm_query=user_name=${username}&sysparm_fields=${encodeURIComponent(sysparm_fields)}&sysparm_limit=${sysparm_limit}`;
    console.log('url', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    if (response.ok) {
      const data = await response.json();
      const user = {
        name: data.result[0].name,
        email: data.result[0].email,
        sys_id: data.result[0].sys_id,
        authToken: credentials
      };
      console.log('User data:', user);

      // Save to window.NOW_ANYWHERE
      window.NOW_ANYWHERE.user = user;

      // Save to local storage
      localStorage.setItem('user', JSON.stringify(user));

      document.getElementById('error-msg').textContent = `Logged in successfully. User email: ${user.email}`;

      // Redirect to workspace
      window.location.href = 'workspace.html';
    } else {
      const errorText = await response.text();
      console.error('Login failed:', errorText);
      document.getElementById('error-msg').textContent = `Login failed: ${errorText}`;
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('error-msg').textContent = `Error: ${error.message}`;
  }
}

document.getElementById('login_button_2').addEventListener('click', async (e) => {
  e.preventDefault();
  const username =  document.getElementById('user_name').value;
  const password = document.getElementById('user_password').value;
  await loginWithBasicAuth(username, password);
});
