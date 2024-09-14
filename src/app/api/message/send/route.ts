import { fetchredis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { nanoid } from "nanoid" // Import the nanoid function
import { messageValidator } from "@/lib/validations/message"
import { pusherServer } from "@/lib/pusher"
import { topusherKey } from "@/lib/utils"

export async function POST(req: Request) {
    try {
        const { text, chatId }: { text: string, chatId: string } = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        const [userId1, userId2] = chatId.split('--');

        if (userId1 !== session.user.id && userId2 !== session.user.id) {
            return new Response('Unauthorized', { status: 401 })
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1

        const friendlist = await fetchredis('smembers', `user:${session.user.id}:friends`) as string[]

        const isFriend = friendlist.includes(friendId)
        if (!isFriend) {
            return new Response('Unauthorized', { status: 401 })
        }

        const rawsender = await fetchredis('get', `user:${session.user.id}`) as string
        const sender = JSON.parse(rawsender) as User

        const timestamp = Date.now()
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
            receiverId: ""
        }

        const message = messageValidator.parse(messageData);

        pusherServer.trigger(topusherKey(`chat:${chatId}`), 'incoming_message', message)

        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        })

        return new Response('OK')

    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 })
        }
        return new Response('Internal server error', { status: 500 })
    }
}