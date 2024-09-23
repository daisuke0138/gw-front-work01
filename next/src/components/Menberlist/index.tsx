import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./style.module.scss";
import apiClient from "@/lib/apiClient";
import Link from "next/link";

interface User {
    id: number;
    profile_image: string;
    username: string;
    number: string;
    department: string;
    classification: string;
    hoby: string;
    business_experience: string;
}

const Menberlist: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login'); // トークンがない場合はログイン画面へリダイレクト
                return;
            }

            try {
                const response = await apiClient.get('/auth/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data.users);
            } catch (error: unknown) {
                console.error('Failed to fetch user:', error);
                if (error instanceof Error && (error as { response?: { status: number } }).response?.status === 401) {
                    router.push('/login'); // 認証エラーの場合もログイン画面へリダイレクト
                }
            }
        };

        fetchUsers();
    }, [router]);

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                Menber list
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
                        <th>個人ページ</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>写真</td>
                            <td>{user.username}</td>
                            <td>{user.number}</td>
                            <td>{user.department}</td>
                            <td>{user.classification}</td>
                            <td>{user.hoby}</td>
                            <td>{user.business_experience}</td>
                            <td><Link href={`/menbershow?id=${user.id}`}>詳細</Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Menberlist;

