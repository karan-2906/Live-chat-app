'use client'
import { cn, topusherKey } from "@/lib/utils"
import { FC, useEffect, useRef, useState } from "react"
import { format } from 'date-fns/format'
import Image from "next/image"
import { pusherClient } from "@/lib/pusher"

interface Messageprops {
    initialmessages: Message[]
    sessionId: string
    chatId: string
    sessionImg: string | null | undefined
    chatpartner: User
}

const Messages: FC<Messageprops> = ({
    initialmessages, sessionId, sessionImg, chatpartner, chatId
}) => {

    const [messages, setMessages] = useState<Message[]>(initialmessages)

    useEffect(() => {
        pusherClient.subscribe(topusherKey(`chat:${chatId}`))

        const messageHandler = (message: Message) => {
            setMessages((prevMessages) => [message, ...prevMessages])
        }

        pusherClient.bind('incoming_message', messageHandler)

        return () => {
            pusherClient.unsubscribe(topusherKey(`chat:${chatId}`))
            pusherClient.unbind('incoming_message', messageHandler)
        }

    }, [chatId])

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formattimestamp = (timestamp: number) => {
        return format(timestamp, 'HH:mm')
    }

    return (
        <div id="messages" className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-rounded scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
            <div ref={scrollDownRef} />

            {messages.map((message, index) => {
                const iscurrentUser = message.senderId === sessionId

                const hasnextmessagefromsameuser = messages[index - 1]?.senderId === messages[index].senderId


                return (
                    <div className="chat-message" key={`${message.id}-${message.timestamp}`}>
                        <div className={cn('flex items-end', {
                            "justify-end": iscurrentUser,
                        })}>
                            <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                                'order-1 items-end': iscurrentUser,
                                'order-2 items-start': !iscurrentUser,
                            })}>
                                <span className={cn('px-4 py-2 rounded-lg inline-block', {
                                    'bg-indigo-600 text-white': iscurrentUser,
                                    'bg-gray-200 text-gray-900': !iscurrentUser,
                                    'rounded-br-none': !hasnextmessagefromsameuser && iscurrentUser,
                                    'ropunded-bl-none': !hasnextmessagefromsameuser && !iscurrentUser,
                                })}>
                                    {message.text}{' '}
                                    <span className="ml-2 text-xs text-gray-400">
                                        {formattimestamp(message.timestamp)}
                                    </span>
                                </span>
                            </div>
                            <div className={cn('relative w-6 h-6', {
                                'order-2': iscurrentUser,
                                'order-1': !iscurrentUser,
                                'invisible': hasnextmessagefromsameuser
                            })}>
                                <Image
                                    fill
                                    src={iscurrentUser ? (sessionImg as string) : chatpartner.image}
                                    alt="Profile Picture"
                                    referrerPolicy="no-referrer"
                                    className="rounded-full" />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Messages