import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
}

export function topusherKey(key :string) {
     return key.replace(/:/g, '__')
}

export function chathrefconstructor(id1: string, id2: string) {
     const sortedIds = [id1, id2].sort()
     return `${sortedIds[0]}--${sortedIds[1]}`
}