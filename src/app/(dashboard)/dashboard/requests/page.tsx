import AddFriendButton from "@/components/AddFriendButton"
import FriendRequests from "@/components/FriendRequests"
import { fetchredis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { FC } from "react"


const page: FC = async () => {

    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const incomingSenderIds =  (await fetchredis(
        'smembers',
        `user:${session.user.id}:incoming_friend_request`
    )) as string[]

    const incomingfriendrequest = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = (await fetchredis("get", `user:${senderId}`)) as string
            const senderparsed = JSON.parse(sender)
            return { senderId, senderemail: senderparsed.email }
        })
    )

    return (
        <div className="pt-8">
            <h1 className="font-bold text-5xl mb-8 ">Add a Friend</h1>
            <div className="felx flex-col gap-4 ">
                <FriendRequests incomingFriendRequests={incomingfriendrequest} sessionId={session.user.id} />
            </div>
        </div>
    )
}

export default page