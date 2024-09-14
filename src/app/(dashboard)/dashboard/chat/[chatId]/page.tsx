import Chatinput from '@/components/Chatinput'
import Messages from '@/components/Messages'
import { fetchredis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface pageProps {
    params: {
        chatId: string
    }
}

async function getchatmessages(chatId: string) {
    try {
        const result: string[] = await fetchredis(
            'zrange',
            `chat:${chatId}:messages`,
            0,
            -1
        )

        const dbmessages = result.map((message) => JSON.parse(message) as Message)

        const reverseDbmessages = dbmessages.reverse()

        const messages = messageArrayValidator.parse(reverseDbmessages)

        return messages;
    } catch (error) {
        notFound()
    }
}

const page = async ({ params }: pageProps) => {

    const { chatId } = params
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const { user } = session

    const [userId1, userId2] = chatId.split('--')

    if (userId1 !== user.id && userId2 !== user.id) notFound()

    const chatpartnerId = user.id === userId1 ? userId2 : userId1
    const chatpartner = (await db.get(`user:${chatpartnerId}`)) as User
    const initialmessages = await getchatmessages(chatId)


    return (
        <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
            <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
                <div className='relative flex items-center space-x-4'>
                    <div className='relative'>
                        <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
                            <Image
                                fill
                                referrerPolicy='no-referrer'
                                src={chatpartner.image}
                                alt={`${chatpartner.name} profile picture`}
                                className='rounded-full'
                            />
                        </div>
                    </div>

                    <div className='flex flex-col leading-tight'>
                        <div className='text-xl flex items-center'>
                            <span className='text-gray-700 mr-3 font-semibold'>
                                {chatpartner.name}
                            </span>
                        </div>
                        <span className='text-sm text-gray-600'>
                            {chatpartner.email}
                        </span>

                    </div>
                </div>
            </div>

            <Messages chatId={chatId} chatpartner={chatpartner} sessionImg={session.user.image} initialmessages={initialmessages} sessionId={session.user.id} />
            <Chatinput chatpartner={chatpartner} chatId={chatId} />
        </div>
    )
}

export default page