'use client'

import { pusherClient } from "@/lib/pusher"
import { topusherKey } from "@/lib/utils"
import axios from "axios"
import { Check, UserPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[],
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({
    incomingFriendRequests,
    sessionId
}) => {
    const router = useRouter()

    const [friendrequest, setFriendrequest] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    useEffect(() => {
        pusherClient.subscribe(topusherKey(`user:${sessionId}:incoming_friend_request`))

        const friendRequestHandler = ({ senderId, senderemail }: IncomingFriendRequest) => {
            setFriendrequest((prev) => [...prev, {senderId, senderemail}])
        }

        pusherClient.bind('incoming_friend_request', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(topusherKey(`user:${sessionId}:incoming_friend_request`))
            pusherClient.unbind('incoming_friend_request', friendRequestHandler)
        }

    }, [sessionId])

    const acceptfriend = async (senderId: string) => {
        await axios.post('/api/friends/accept', { id: senderId })

        setFriendrequest((prev) => prev.filter((request) => request.senderId !== senderId))

        router.refresh()
    }

    const denyfriend = async (senderId: string) => {
        await axios.post('/api/friends/deny', { id: senderId })

        setFriendrequest((prev) => prev.filter((request) => request.senderId !== senderId))

        router.refresh()
    }


    return (
        <>
            {friendrequest.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing to show here...</p>
            ) : (
                friendrequest.map((request) => (
                    <div key={request.senderId} className='flex gap-4 items-center'>
                        <UserPlus className='text-black' />
                        <p className='font-medium text-lg'>{request.senderemail}</p>
                        <button aria-label="Accept Friend" className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
                            onClick={() => acceptfriend(request.senderId)}>
                            <Check className="font-semibold text-white w-3/4 h-3/4" />
                        </button>
                        <button aria-label="Deny Friend" className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
                            onClick={() => denyfriend(request.senderId)}>
                            <X className="font-semibold text-white w-3/4 h-3/4" />
                        </button>
                    </div>
                ))
            )}
        </>
    )
}

export default FriendRequests