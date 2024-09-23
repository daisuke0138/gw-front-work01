import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/apiClient";
import styles from "./style.module.scss";

interface Userdata {
    id: number;
    username: string;
    number: string;
    department: string;
    classification: string;
    hoby: string;
    business_experience: string;
}

const Useredit: React.FC = () => {
    const [user, setUser] = useState<Userdata | null>(null);
    const [formData, setFormData] = useState<Userdata | null>(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!router.isReady) return;

        const fetchUser = async () => {
            try {
                const response = await apiClient.post(`/auth/useredit`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                setUser(response.data.user);
                setFormData(response.data.user);
            } catch (error) {
                console.error('Failed to fetch user:', error);
                router.push('/login');
            }
        };

        fetchUser();
    }, [router, id]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!formData) return;

        try {
            const response = await apiClient.post(`/auth/useredit`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
            });
            console.log('User updated:', response.data);
            // フォーム送信完了後にリダイレクト
            router.push('/user');
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        if (formData) {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit}>
                <div>
                <h2 className={styles.heading}>
                    My Profile
                    <button className={styles.button} type="submit">保存</button>
                </h2>
                </div>
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
                            <td>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData?.username || ''}
                                    onChange={handleChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="number"
                                    value={formData?.number || ''}
                                    onChange={handleChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData?.department || ''}
                                    onChange={handleChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="classification"
                                    value={formData?.classification || ''}
                                    onChange={handleChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="hoby"
                                    value={formData?.hoby || ''}
                                    onChange={handleChange}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    name="business_experience"
                                    value={formData?.business_experience || ''}
                                    onChange={handleChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
};

export default Useredit;