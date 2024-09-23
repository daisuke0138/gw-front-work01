import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/apiClient";
import styles from "./style.module.scss";
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

const Mebershow: React.FC = () => {
    const [user, setUser] = useState<Userdata | null>(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!router.isReady) return; // ルーターが準備できていない場合は何もしない

        console.log('router.query:', router.query); // router.queryの確認
        console.log('User ID:', id); // IDの確認

        const fetchUser = async () => {
            if (!id) return;

            const apiUrl = `/auth/user/${id}`;
            console.log('API Request URL:', apiUrl); // APIリクエストURLの確認

            try {
                const response = await apiClient.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                console.log('Response data:', response.data); // ここでレスポンスデータをコンソールに表示
                setUser(response.data.user);
            } catch (error: unknown) {
                console.error('Failed to fetch user:', error);
            }
        };

        fetchUser();
    }, [id, router.isReady, router.query]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                User Profile
                <Link href={`/`}>Menber listへ</Link>
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

export default Mebershow;