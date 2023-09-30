import {Client} from "discord.js";
import {getChannel, getLatestMembers} from "./utils.ts";
import {startTask} from "./task.ts";

export async function start(client: Client) {
    const channel = await getChannel(client)

    const guild = channel.guild

    console.log('Found guild', guild.name)

    const members = await getLatestMembers(guild)
    console.log('Found members', members.map(m => m.user.tag).join(', '))

    startTask(client)
}
