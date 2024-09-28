import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
import styles from "./style.module.scss";
import apiClient from "@/lib/apiClient";
import Link from "next/link";

interface Userdata {
    id: number;
    profile_image: string;
    username: string;
    number: string;
    department: string;
    classification: string;
    hoby: string;
    business_experience: string;
}

const Doc: React.FC = () => {
    const [user, setUser] = useState<Userdata | null>(null);
    const router = useRouter();

    const fetchUsers = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login'); // トークンがない場合はログイン画面へリダイレクト
            return;
        }
        try {
            const response = await apiClient.get('/api/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };


    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                Document creat
                <Link className={styles.link} href={`/user`}>戻る</Link>
            </h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>作成者:{user?.username}</th>
                        <th>社員番号:{user?.number}</th>
                        <th>部署:{user?.department}</th>
                        <th>職能:{user?.classification}</th>
                    </tr>
                </thead>
            </table>
            <div className={styles.title}>
            <input type="text" name="title" value="タイトル:" />
            <input type="text" name="title" value="概要:" />
            <input type="text" name="title" value="成果:" />
            </div>
            <div className={styles.canvasarea}>
                <div className={styles.toolbar}>
                    <button id="pencilButton">鉛筆</button>
                    <button id="eraserButton">消しゴム</button>
                    <button id="rectButton">四角形</button>
                    <button id="circleButton">円</button>
                    <button id="saveButton">保存</button>
                    <button id="loadButton">読み込み</button>
                    <button id="clearButton">クリア</button>
                </div>
                <canvas className={styles.canvassize} id="myCanvas"></canvas>
            </div>
        </div>
    );
};
export default Doc;
