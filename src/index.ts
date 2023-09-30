import {Client, Events, GatewayIntentBits} from 'discord.js';
import {start} from "./setup.ts";

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]});

client.once(Events.ClientReady, (client) => {
    console.log(`Ready! Logged in as ${client.user.tag}`);

    start(client).catch(err => {
        console.error(err)
        process.exit(1)
    })
});

client.login(process.env.DISCORD_TOKEN);
