import FriendRequestsSidebaroption from "@/components/FriendRequestsSidebaroption";
import { Icon, Icons } from "@/components/Icons";
import Sidebarchatlist from "@/components/Sidebarchatlist";
import SignOutButton from "@/components/SinOutButton";
import { getFriendsByUserId } from "@/helpers/get-friends-by-user-id";
import { fetchredis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FC, ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}
interface SidebarOption {
    id: number
    name: string
    Icon: Icon
    herf: string
}

const sidebarOptions: SidebarOption[] = [
    { id: 1, name: 'Add Friend', Icon: "UserPlus", herf: '/dashboard/add' },
]

const Layout = async ({ children }: LayoutProps) => {
    const session = await getServerSession(authOptions)

    if (!session) notFound()

    const friends = await getFriendsByUserId(session.user.id)
    console.log(friends.length)

    const unseenRequestCount = (
        (await fetchredis(
            'smembers',
            `user:${session.user.id}:incoming_friend_request`
        )) as User[]
    ).length
    console.log(unseenRequestCount)


    return (
        <div className="w-full flex h-screen ">
            <div className="flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                <Link href='/dashboard' className="flex h-16 shrink-0 items-center ">
                    <Icons.Logo />
                </Link>

                {friends.length > 0 ? (<div className="text-xs font-semibold leading-6 text-gray-600">
                    Your Chats
                </div>) : null}

                <nav className="flex flex-col flex-1">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <Sidebarchatlist friends={friends} sessionId={session.user.id}/>
                        </li>
                        <li>
                            <div className="text-xs font-semibold leading-6 text-gray-400">
                                Overview
                            </div>

                            <ul role="list" className=" -mx-2 mt-2 space-y-1">
                                {sidebarOptions.map((option) => {
                                    const Icon = Icons[option.Icon]
                                    return (
                                        <li key={option.id} >
                                            <Link href={option.herf} className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 text-sm leading-6 font-semibold p-2 rounded-md">
                                                <span className="text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] bg-white font-medium">
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="truncate">{option.name}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                                <li>
                                    <FriendRequestsSidebaroption sessionId={session.user.id} initialUnseenRequestCount={unseenRequestCount} />
                                </li>
                            </ul>
                        </li>


                        <li className="-mx-6 mt-auto flex items-center mb-2">
                            <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                                <div className="relative h-8 w-8 bg-gray-50">
                                    <Image fill referrerPolicy="no-referrer" className="rounded-full" src={session.user.image || ''}
                                        alt="Your Profile Picture" />
                                </div>

                                <span className="sr-only">Your Profile</span>
                                <div className="flex flex-col">
                                    <span aria-hidden='true'>{session.user.name}</span>
                                    <span className="text-xs text-zinc-400" aria-hidden='true'>{session.user.email}</span>
                                </div>
                            </div>
                            <SignOutButton className="h-full aspect-square" />
                        </li>
                    </ul>
                </nav>
            </div>
            <aside className="max-h-screen container py-16 md:py-12 w-full">{children}</aside>
        </div >
    );
};

export default Layout;