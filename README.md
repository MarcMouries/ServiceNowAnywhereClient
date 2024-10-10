# ServiceNow Anywhere Client



## Prerequisites

1. **Rust**: Ensure you have Rust installed. You can install Rust using `rustup`:

   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2.  **Bun**:

    ```bash
    curl https://bun.sh/install | bash
    ```

3. **Tauri CLI**:

   ```shell
   cargo install tauri-cli
   ```

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/)
 + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
 + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
 + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## Setting up the Project

1. Clone the Repository:
   ```shell
   git clone https://github.com/MarcMouries/ServiceNowAnywhere.git
   cd ServiceNowAnywhere
   ```

2. Install Dependencies:

   ```shell
   bun install
   ```


# update project
```shell
bun install @tauri-apps/cli@next @tauri-apps/api@next
cargo update
```
