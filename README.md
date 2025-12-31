# Discord-focus-mute
This lightweight, Dockerized API allows you to automatically mute and unmute specific batches of Discord servers based on custom "Focus Modes" (Work, Gaming, Study...).

Designed to bridge the gap between Discord and automation tools like Apple Shortcuts, it lets you trigger complex notification settings with a simple HTTP request.

## Key Features
- **Dockerized** : Easy to deploy on any VPS or home server.
- **Apple Ecosystem Ready** : Perfect for triggering via iOS Automations when turning on a Focus Mode.
- **Smart Toggling** : Automatically handles both /mute and /unmute actions from a single configuration file.
- **File-Based Config** : Simply drop a text file with your request logs to create a new mode—no complex database required.

## **Disclaimer**

By using this code, you are automating your Discord Account. This is against Discord's Terms of Service and Community Guidelines. If not used properly, your account(s) might get suspended or terminated by Discord.
I, the developer, am not responsible for any consequences that may arise from the use of this code. Use this software at your own risk and responsibility. Learn more about [Discord's Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).

**This repository is in no way affiliated with, authorized, maintained, sponsored, or endorsed by Discord Inc. (discord.com) or any of its affiliates or subsidiaries.**

**DO NOT GIVE YOUR DISCORD TOKENS TO ANYONE.**

**Giving your token to someone else will give them the ability to log into your account without the password or 2FA.**

## Installation with docker

1. Clone the repo and cd into the folder
2. For each focus mode you want to create, create a file in the `focus-modes` folder with the name of your choice and the `.txt` extension (eg. `work.txt`, `study.txt`).
   Each file must contain the list of PATCH requests to mute the servers you want to mute when you call the endpoint.
   Here's how to get your PATCH requests from Discord:
    - Open Discord in your browser and open Developer Tools (F12)
    - Go to the Network tab
    - Manually mute a server in Discord
    - Find the PATCH request that appears in the Network tab
    - Copy the entire fetch request and paste it into `focus-modes/YOUR_FOCUS_MODE.txt`
      (right-click Copy Value > Copy as Fetch on Firefox)
    - Repeat for each server you want to mute (you only need to do this setup once)

   ⚠️ CAREFUL ! Those requests contain your user token, it is very important not to share them with ANYONE.

3. Still on the repo folder, execute this command to build the dockerfile :

```bash
 docker build -t discord-focus-mute .
```

4. Then, execute this command to launch the container :

```bash
 docker run --rm -p 3000:3000 -v "$(pwd)/focus-modes":/app/focus-modes discord-focus-mute
```

5. The server checks a secret key passed as a query parameter (`?key=...`) to authorize actions and avoid bots. Create a .env file in the root of the project with the following content :
    ```env
   SECRET_KEY=your_secret_key_here
   ```
7. Restart the docker container to take into account the .env file
8. You can now call the endpoint to mute the servers listed in `YOUR_FOCUS_MODE.txt` by going to `http://localhost:3000/YOUR_FOCUS_MODE/mute?key=your_secret_key` or `/unmute`

Feel free to use your own domain name 😉

## Use it with Apple Shortcuts

1. Go to the `automations` tab
2. Select your focus mode and select "When turning On/Off" based on your need.
3. Select "Create a new empty automation"
4. In the search bar type "Get contents of URL" and paste your API url (with the focus mode and the mute/unmute) in the `URL` field.
5. Repeat for each focus mode

And that's it ! When you'll change your focus mode, it'll mute/unmute your servers !
You can customize it so it can send you a confirmation notification...

## Coming Soon :
- Mute specific channels
- Mute DMs
- WebUI to make setup easier than with a text file, and make the success response prettier
