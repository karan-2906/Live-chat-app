
import Button from "@/components/ui/Button"
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id"
import { fetchredis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { chathrefconstructor } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { getServerSession } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

const page = async () => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)

    const friendswithlastmessage = await Promise.all(
        friends.map(async (friend) => {
            const [lastmessageraw] = await fetchredis('zrange', `chat:${chathrefconstructor(session.user.id, friend.id)}:messages`, -1, -1) as string[]
            
            let lastmessage: Message | null = null
            if (lastmessageraw) {
                lastmessage = JSON.parse(lastmessageraw) as Message
            }

            return { ...friend, lastmessage }
        })
    )

    return (
        <div className="container py-12">
            <h1 className="font-bold text-xl md:text-5xl mb-8">
                Recent Chats
            </h1>
            {friendswithlastmessage.length === 0 ? (
                <p className="text-sm text-zinc-500">No Recent Chats...</p>
            ) : friendswithlastmessage.map((friend) => (
                <div key={friend.id} className="relative bg-zinc-50 border border-zinc-200 p-3 rounded-md">
                    <div className="absolute right-4 inset-y-0 flex items-center">
                        <ChevronRight className="h-7 w-7 text-zinc-400" />
                    </div>
                    <Link href={`/dashboard/chat/${chathrefconstructor(session.user.id, friend.id)}`} className="relative sm:flex">
                        <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                            <div className="relative h-6 w-6">
                                <Image referrerPolicy="no-referrer" className="rounded-full" alt={`${friend.name} profile picture`} src={friend.image} fill />
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold">{friend.name}</h4>
                            <p className="mt-1 max-w-screen-md">
                                <span className="text-zinc-400">
                                    {friend.lastmessage?.senderId === session.user.id ? 'You: ' : ''}
                                </span>
                                {friend.lastmessage?.text}
                            </p>
                        </div>
                    </Link>
                </div>
            ))}

        </div>
    )
}

export default page