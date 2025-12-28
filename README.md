# Discord-focus-mute

Mute specific discord servers by calling a single self-hosted API endpoint using docker.

## **Disclaimer**

By using this code, you are automating your Discord Account. This is against Discord's Terms of Service and Community Guidelines. If not used properly, your account(s) might get suspended or terminated by Discord.
I, the developer, am not responsible for any consequences that may arise from the use of this code. Use this software at your own risk and responsibility. Learn more about [Discord's Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).

**This repository is in no way affiliated with, authorized, maintained, sponsored, or endorsed by Discord Inc. (discord.com) or any of its affiliates or subsidiaries.**

## **Warning**

**DO NOT GIVE YOUR DISCORD TOKENS TO ANYONE.**

**Giving your token to someone else will give them the ability to log into your account without the password or 2FA.**

## Installation with docker

1. Clone the repo
2. Edit the `server_requests_list.txt` file by capturing the PATCH requests from Discord:
    - Open Discord in your browser and open Developer Tools (F12)
    - Go to the Network tab
    - Manually mute a server in Discord
    - Find the PATCH request that appears in the Network tab
    - Copy the entire fetch request and paste it into `server_requests_list.txt`
    - Repeat for each server you want to mute (you only need to do this setup once)

   ⚠️ CAREFUL ! Those requests contains your user token, it is very important not to share them with ANYONE.

3. On your server, execute this command to build the dockerfile :

```bash
 docker build -t discord-focus-mute .
```

1. On your server, execute this command to launch the container :

```bash
 docker run --rm -p 3000:3000 -v "$(pwd)/server_requests_list.txt":/app/data/server_requests_list.txt discord-focus-mute
```

You should see this message after it finished : `API Server ready on : http://localhost:3000/start`

Feel free to use your own domain name 😉

## Coming Soon :

- Multiple endpoints for multiple focus modes
- Mute DMs
- WebUI to make setup easier than with a text file, and make the success response prettier