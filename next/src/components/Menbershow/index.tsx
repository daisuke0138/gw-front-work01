import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/apiClient";
import { Camera } from 'lucide-react'
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss";


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
            <div className={styles.header}>
                <h2 className={styles.title}>Menber Profile</h2>
            </div>
            <div className={styles.grid}>
                <div className={styles.imageUpload}>
                    <Label htmlFor="profile-image">プロフィール画像</Label>
                    <div className={styles.imagePreview}>
                        {user.profile_image ? (
                            <img
                                src={user.profile_image}
                                alt="プロフィール画像"
                                className={styles.previewImage}
                            />
                        ) : (
                            <span className={styles.ifno}>プロフィール画像がありません</span>
                        )}
                        <Camera className={styles.cameraIcon} />
                    </div>
                </div>
                <div>
                    <Label htmlFor="username">氏名</Label>
                    <p className={styles.p}>{user.username}
                    </p>
                </div>
                <div>
                    <Label htmlFor="number">社員番号</Label>
                    <p className={styles.p}>{user.number}
                    </p>
                </div>
                <div>
                    <Label htmlFor="department">部署</Label>
                    <p className={styles.p}>{user.department}
                    </p>
                </div>

                <div>
                    <Label htmlFor="classification">職能</Label>
                    <p className={styles.p}>{user.classification}
                    </p>
                </div>

                <div>
                    <Label htmlFor="hoby">趣味</Label>
                    <p className={styles.p}>{user.hoby}
                    </p>
                </div>

                <div className={styles.fullWidth}>
                    <Label htmlFor="business_experience">業務経験</Label>
                    <p className={styles.p}>{user.business_experience}
                    </p>
                </div>
            </div>
        </div>
    )
};

export default Mebershow;