import { fetchredis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { topusherKey } from "@/lib/utils"
import { addFriendValidator } from "@/lib/validations/add-friends"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        console.log(body)

        const { email: emailToAdd } = addFriendValidator.parse(body)
        console.log(emailToAdd)

        const idToAdd = (await fetchredis(
            'get',
            `user:email:${emailToAdd}`
        )) as string


        if (!idToAdd) {
            return new Response('This Person does not exist', { status: 400 })
        }

        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response('You need to be logged in to add friends', { status: 401 })
        }

        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself as a friend', { status: 400 })
        }


        const isAlreadyadded = (await fetchredis(
            'sismember',
            `user:${idToAdd}:incoming_friend_request`,
            session.user.id
        )) as 0 | 1

        if (isAlreadyadded) {
            return new Response('You have already sent a friend request to this user', { status: 400 })
        }

        const isAlreadyFriend = (await fetchredis(
            'sismember',
            `user:${session.user.id}:friends`,
            idToAdd
        )) as 0 | 1

        if (isAlreadyFriend) {
            return new Response('You are already friends with this user', { status: 400 })
        }

        console.log("trigger pusher")

        await pusherServer.trigger(topusherKey(`user:${idToAdd}:incoming_friend_request`), 'incoming_friend_request', {
            senderId: session.user.id,
            senderemail: session.user.email
        })


        db.sadd(`user:${idToAdd}:incoming_friend_request`, session.user.id)

        console.log()
        return new Response('Friend request sent', { status: 200 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid Requet Payload", { status: 422 })
        }

        return new Response('Invalid Request', { status: 400 })
    }
}