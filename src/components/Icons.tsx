import { LucideProps, UserPlus } from "lucide-react";
import Image from "next/image";

export const Icons = {
    Logo: () => (
        <Image
            src='/logo.png'
            alt='logo'
            width={100}
            height={100}
        />
    ),
    UserPlus
}

export type Icon = keyof typeof Icons