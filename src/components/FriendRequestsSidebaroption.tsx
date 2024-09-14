'use client'

import { User } from "lucide-react"
import Link from "next/link"
import { FC, useEffect, useState } from "react"
import { pusherClient } from "@/lib/pusher"
import { topusherKey } from "@/lib/utils"

interface FriendRequestsSidebaroptionProps {
    sessionId: string
    initialUnseenRequestCount: number
}

const FriendRequestsSidebaroption: FC<FriendRequestsSidebaroptionProps> = ({ sessionId, initialUnseenRequestCount }) => {
    const [unseeeRequestCount, setUnseeeRequestCount] = useState<number>(initialUnseenRequestCount)

    useEffect(() => {
        pusherClient.subscribe(topusherKey(`user:${sessionId}:incoming_friend_request`))

        const friendRequestHandler = () => {
           setUnseeeRequestCount((prev) => prev + 1)
        }

        pusherClient.bind('incoming_friend_request', friendRequestHandler)

        return () => {
            pusherClient.unsubscribe(topusherKey(`user:${sessionId}:incoming_friend_request`))
            pusherClient.unbind('incoming_friend_request', friendRequestHandler)
        }

    }, [])

    return (
        <Link href='/dashboard/requests' className="text-gray-700 p-2 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md text-sm leading-6 font-semibold">
            <div className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex font-medium bg-white h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] ">
                <User className="h-4 w-4" />
            </div>
            <p className="truncate">Friend Requests</p>
            {unseeeRequestCount > 0 ? (<div className="rounded-full px-2 py-1 text-sm flex justify-center items-center text-white bg-indigo-600">{unseeeRequestCount}</div>) : null}
        </Link>
    )
}

export default FriendRequestsSidebaroption 