import { fetchredis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { topusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { promise, z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { id: idToAdd } = z.object
            ({
                id: z.string()
            }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        const isAlreadyFriends = await fetchredis('sismember', `user:${session.user.id}:friends`, idToAdd)

        if (isAlreadyFriends) {
            return new Response('Already friends', { status: 400 })
        }

        const hasFriendRequest = await fetchredis('sismember', `user:${session.user.id}:incoming_friend_request`, idToAdd)

        if (!hasFriendRequest) {
            return new Response('No friend request', { status: 400 })
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchredis('get', `user:${session.user.id}`),
            fetchredis('get', `user:${idToAdd}`)
        ])) as [string, string]

        const user = JSON.parse(userRaw) as User
        const friend = JSON.parse(friendRaw) as User

        await Promise.all([
            await pusherServer.trigger(topusherKey(`user:${idToAdd}:friends`), 'new_friend', user),
            await pusherServer.trigger(topusherKey(`user:${session.user.id}:friends`), 'new_friend', friend),
            await db.sadd(`user:${session.user.id}:friends`, idToAdd),
            await db.sadd(`user:${idToAdd}:friends`, session.user.id),
            await db.srem(`user:${session.user.id}:incoming_friend_request`, idToAdd)
        ])


        return new Response('OK')
    } catch (error) {
        console.error(error)
        if (error instanceof z.ZodError) {
            return new Response('Invalid request Payload', { status: 422 })
        }
        return new Response('Invalid Request', { status: 400 })
    }
}