import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import { Camera } from 'lucide-react'
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss";

interface Userdata {
    id: number;
    username: string;
    email: string;
    password: string;
    number: string;
    profile_image: string | null;
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
            console.log('auth_tokeny', localStorage.getItem('auth_token')); 
            try {
                const response = await apiClient.get('/auth/user', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token') }`,
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
                <div className={styles.header}>
                    <h2 className={styles.title}>My Profile</h2>
                    <Link className={styles.info} href={`/useredit`}>Edit</Link>
                    <Link className={styles.info} href={`/doc`}>Document creat</Link>
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
                                <span className={styles.info}>プロフィール画像がありません</span>
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
export default User