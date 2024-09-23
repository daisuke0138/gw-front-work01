import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./style.module.scss";
import apiClient from "@/lib/apiClient";
import Link from "next/link";

interface Userdata {
    id: number;
    username: string;
    email: string;
    number: string;
    profile_image: string;
    department: string;
    classification: string;
    hoby: string;
    business_experience: string;
}

const User: React.FC = () => {
    const [user, setUser] = useState<Userdata | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/login'); // トークンがない場合はログインページにリダイレクト
                    return;
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

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                My Profile
                <Link className={styles.link} href={`/useredit`}>プロフedit</Link>
                <Link className={styles.link} href={`/doc`}>Document creat</Link>
            </h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>profile</th>
                        <th>氏名</th>
                        <th>社員番号</th>
                        <th>部署</th>
                        <th>職能</th>
                        <th>趣味</th>
                        <th>業務経験</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>写真</td>
                        <td>{user.username}</td>
                        <td>{user.number}</td>
                        <td>{user.department}</td>
                        <td>{user.classification}</td>
                        <td>{user.hoby}</td>
                        <td>{user.business_experience}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
export default User;