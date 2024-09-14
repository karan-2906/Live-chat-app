import { fetchredis } from "./redis"

export const getFriendsByUserId = async (userId: string) => {

    const friendids = await fetchredis('smembers', `user:${userId}:friends`) as string[]

    const friends = await Promise.all(
        friendids.map(async (friendId) => {
            const friend = await fetchredis('get', `user:${friendId}`) as string
            const parsedFriend = JSON.parse(friend) as User
            return parsedFriend
        })
    )

    return friends
}