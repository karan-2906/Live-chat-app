import toast from "react-hot-toast"

const redisresturl = process.env.UPSTASH_REDIS_REST_URL
const redisresttoken = process.env.UPSTASH_REDIS_REST_TOKEN

type Commands = 'zrange' | 'sismember' | 'get' | 'smembers'

export async function fetchredis(
    command: Commands,
    ...args: (string | number)[]
) {
    const commandUrl = `${redisresturl}/${command}/${args.join('/')}`
    const response = await fetch(commandUrl, {
        headers: {
            Authorization: `Bearer ${redisresttoken}`
        },
        cache: 'no-store'
    })

    if (!response.ok) {
        toast.error(`Failed to fetch from Redis: ${response.statusText}`)
    }

    const data = await response.json()

    return data.result
}