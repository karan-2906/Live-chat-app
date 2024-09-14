import { fetchredis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { id: idToDeny } = z.object
            ({
                id: z.string()
            }).parse(body)

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        const hasFriendRequest = await fetchredis('sismember', `user:${session.user.id}:incoming_friend_request`, idToDeny)

        if (!hasFriendRequest) {
            return new Response('No friend request', { status: 400 })
        }

        await db.srem(`user:${session.user.id}:incoming_friend_request`, idToDeny)

        return new Response('OK')
    } catch (error) {
        console.error(error)
        if(error instanceof z.ZodError){
            return new Response('Invalid request Payload', { status: 422 })
        }
        return new Response('Invalid Request', { status: 400 })
    }

}