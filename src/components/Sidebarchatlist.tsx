'use client'

import { pusherClient } from "@/lib/pusher"
import { chathrefconstructor, topusherKey } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import toast from "react-hot-toast"
import Unseenchattoast from "./Unseenchattoast"

interface Sidebarchatlistprops {
    friends: User[]
    sessionId: string
}

interface ExtentedMessage extends Message {
    senderName: string
    senderImg: string
}


const Sidebarchatlist: FC<Sidebarchatlistprops> = ({ friends, sessionId }) => {
    const router = useRouter()
    const pathname = usePathname()
    const [unseeenmessage, setUnseenmessage] = useState<Message[]>([])

    useEffect(() => {
        pusherClient.subscribe(topusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(topusherKey(`user:${sessionId}:friends`))
    
        const newFriendHandler = (newFriend: User) => {
          console.log("received new user", newFriend)
        //   setActiveChats((prev) => [...prev, newFriend])
        }
    
        const chatHandler = (message: ExtentedMessage) => {
            // console.log("received new message", message)
          const shouldNotify =
            pathname !==
            `/dashboard/chat/${chathrefconstructor(sessionId, message.senderId)}`
    
          if (!shouldNotify) return
    
          // should be notified
          toast.custom((t) => (
            <Unseenchattoast
              t={t}
              sessionId={sessionId}
              senderId={message.senderId}
              senderImg={message.senderImg}
              senderMessage={message.text}
              senderName={message.senderName}
            />
          ))
    
          setUnseenmessage((prev) => [...prev, message])
        }
    
        pusherClient.bind('new_message', chatHandler)
        pusherClient.bind('new_friend', newFriendHandler)
    
        return () => {
          pusherClient.unsubscribe(topusherKey(`user:${sessionId}:chats`))
          pusherClient.unsubscribe(topusherKey(`user:${sessionId}:friends`))
    
          pusherClient.unbind('new_message', chatHandler)
          pusherClient.unbind('new_friend', newFriendHandler)
        }
      }, [pathname, sessionId, router])

    useEffect(() => {
        if (pathname?.includes('chat')) {
            setUnseenmessage((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])

    return (
        <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
            {friends.sort().map((friend) => {
                const unseeenmessagecount = unseeenmessage.filter((unseeenmsg) => {
                    return unseeenmsg.senderId === friend.id
                }).length

                return (
                    <li key={friend.id}>
                        <a href={`/dashboard/chat/${chathrefconstructor(
                            sessionId,
                            friend.id
                        )}`}
                            className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
                            {friend.name}
                            {unseeenmessagecount > 0 ? (
                                <div className="text-xs font-medium text-white p-1 h-4  bg-indigo-600 rounded-full flex justify-center items-center">
                                    {unseeenmessagecount}
                                </div>
                            ) : null}
                        </a>

                    </li>
                )
            })}
        </ul>
    )
}

export default Sidebarchatlist