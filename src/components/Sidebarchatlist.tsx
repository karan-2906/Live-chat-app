'use client'

import { chathrefconstructor } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"

interface Sidebarchatlistprops {
    friends: User[]
    sessionId: string
}

const Sidebarchatlist: FC<Sidebarchatlistprops> = ({ friends, sessionId }) => {
    const router = useRouter()
    const pathname = usePathname()
    const [unseeenmessage, setUnseenmessage] = useState<Message[]>([])

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
                                <div className="text-xs font-medium text-white 1-4 h-4 bg-indigo-600 rounded-full flex justify-center items-center">
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