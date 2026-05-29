"use client"
import Link from "next/link"
import { clearUser } from "@/lib/features/userSlice"
import { useRouter } from "next/navigation"

import axios from "axios"
import { useAppDispatch } from "@/lib/hooks";

export default function Dashboard() {

    const dispatch = useAppDispatch();

    const router = useRouter();

    const handleLogout = async () => {

        try {
            const response = await axios.post('/api/auth/logout');
            console.log(response);
            dispatch(clearUser());
            router.push('/auth/login')
        }
        catch (error) {
            console.error('logout failed');
        }
    }


    return (
        <div>
            <h1>
                Dashboard
            </h1>

            <button onClick={handleLogout} className=" w-10 h-auto p-2 border border-gray-600 bg-white text-black">
                Logout
            </button>


        </div>
    )
}