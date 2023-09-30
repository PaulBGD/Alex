import {previousSaturday, previousWednesday, setHours, startOfDay} from 'date-fns'
import {Client, DiscordAPIError, RESTJSONErrorCodes} from "discord.js";
import {getChannel, getMembersMissingMessage} from "./utils.ts";
import {PROJECT_UPDATES_CHANNEL_ID} from "./consts.ts";

export function startTask(client: Client) {
    const dmReminders: string[] = []

    setInterval(() => runTask(client, dmReminders).catch(err => console.error('Failed to run task', err)), 1000 * 3)
}

async function runTask(client: Client, dmReminders: string[]) {
    const recentDate = getMostRecentDate()

    if (Date.now() - recentDate.getTime() > 1000 * 60 * 60 * 24) {
        return
    }

    const missingMembers = await getMembersMissingMessage(client, recentDate)

    if (!missingMembers.length) {
        return
    }

    for (const member of missingMembers) {
        const channel = member.dmChannel ?? await member.createDM(true)

        const messages = await channel.messages.fetch({limit: 1, cache: true})
        const message = messages.first()

        try {
            if (!message || message.createdTimestamp < Date.now() - (1000 * 60 * 60)) {
                await member.send(`Hey <@${member.user.id}>, you haven't posted your bi-weekly update yet! Click here to post it: <#${PROJECT_UPDATES_CHANNEL_ID}>`)
            }
        } catch (err) {
            if (err instanceof DiscordAPIError && err.code === RESTJSONErrorCodes.CannotSendMessagesToThisUser) {
                if (!dmReminders.includes(member.user.id)) {
                    dmReminders.push(member.user.id)
                    await channel.send(`Hey <@${member.user.id}>, you have your DMs from this server off. Please enable DMs to receive reminders.`)
                }
            }
        }
    }
}

const HOUR_OF_DAY = 12 // 12pm

function getMostRecentDate(): Date {
    const now = new Date()

    const date = [previousWednesday(now), previousSaturday(now)]
        .map(date => setHours(startOfDay(date), HOUR_OF_DAY))
        .filter(date => date <= now)
        .sort((a, b) => b.getTime() - a.getTime())[0]

    if (!date) {
        throw new Error('Failed to find date')
    }

    return date
}

