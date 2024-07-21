const { invoke } = window.__TAURI__.core;

let greetInputEl;
let errorMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  errorMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}

window.addEventListener("DOMContentLoaded", () => {
  greetInputEl = document.querySelector("#user_name");
  errorMsgEl = document.querySelector("#error-msg");

  document.querySelector("#loginPage").addEventListener("submit", (e) => {
    e.preventDefault();
    greet();
  });

  document.getElementById("mask_icon").addEventListener("click", function () {
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
