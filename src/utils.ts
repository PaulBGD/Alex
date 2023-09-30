import {ChannelType, Client, Guild, GuildMember, TextChannel} from "discord.js";
import {ACCOUNTABLE_ROLE_ID, PROJECT_UPDATES_CHANNEL_ID} from "./consts.ts";

export async function getMembersMissingMessage(client: Client, date: Date): Promise<GuildMember[]> {
    const latestMessages = await getLatestMessage(client)

    return [...latestMessages.entries()]
        .filter(([_, messageDate]) => messageDate < date)
        .map(([member, _]) => member)
}

async function getLatestMessage(client: Client) {
    const channel = await getChannel(client)
    const members = await getLatestMembers(channel.guild)

    const messages = await channel.messages.fetch({
        limit: 20
    })

    const latestMessages: Map<GuildMember, Date> = new Map(members.map(member => [member, new Date(0)]))

    for (const [_, message] of messages.reverse()) {
        const guildMember = await message.member?.fetch()

        if (!guildMember) {
            continue
        }

        if (!members.includes(guildMember)) {
            continue
        }

        latestMessages.set(guildMember, new Date(message.createdTimestamp))
    }

    return latestMessages
}

export async function getLatestMembers(guild: Guild) {
    await guild.members.fetch()

    const role = await guild.roles.fetch(ACCOUNTABLE_ROLE_ID)

    if (!role) {
        throw new Error('Failed to find role')
    }

    return [...role.members.values()]
}

export async function getChannel(client: Client): Promise<TextChannel> {
    const channel = await client.channels.fetch(PROJECT_UPDATES_CHANNEL_ID)

    if (!channel) {
        throw new Error('Failed to find channel')
    }

    if (channel.type !== ChannelType.GuildText) {
        throw new Error('Channel is not a text channel')
    }

    return channel
}
