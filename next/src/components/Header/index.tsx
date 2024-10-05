import React, { useEffect, useState } from "react";
import styles from "./style.module.scss";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/router";

interface Userdata {
    id: number;
    username: string;
    // email: string;
    // password: string;
    // number: string;
    // profile_image: string | null;
    // department: string;
    // classification: string;
    // hoby: string;
    // business_experience: string;
}

const Header = () => {
    const [user, setUser] = useState<Userdata | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log('No auth token found, stopping request.');
                return; // トークンがない場合はリクエストを停止
            }

            try {
                const response = await apiClient.get('/auth/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data.user); // レスポンスの構造に合わせて修正

            } catch (error: unknown) {
                console.error('Failed to fetch user:', error);
                if (error instanceof Error && (error as { response?: { status: number } }).response?.status === 401) {
                    router.push('/login');
                }
            }
        };
        fetchUser();
    }, [router]);

    return (
        <header className={styles.header}>
            <ul>
                <h1>Knowledge sharing room</h1>
                <h1 className={styles.p}>welcome {user ? user.username + "さん" : 'Guest'}</h1>
                <Link href={"/"}>Menber List</Link>
                <Link href={"/user"}>My Page</Link>
                <Link href={"/doc"}>Document creat</Link>
            </ul>
            <ul>
                <li>
                    <Link href={"/login"}>Login</Link>
                </li>
                <li>
                    <Link href={"/logout"}>Logout</Link>
                </li>
                <li>
                    <Link href={"/register"}>Register</Link>
                </li>
            </ul>
        </header>
    );
};

export default Header;