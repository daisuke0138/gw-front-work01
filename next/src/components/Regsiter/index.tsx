import React, { useState, FormEvent } from "react";
import styles from "./style.module.scss";
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/router";

const Register = () => {
    const router = useRouter();
    const [username, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await apiClient.post("/auth/register", {
                username,
                email,
                password,
            });
            alert("アカウント登録できました！");
            router.push("/login");
        } catch (err) {
            console.error(err);
            alert("入力の何かが正しくありません！");
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <h3 className={styles.form__title}>アカウントを作成</h3>

            <div className={styles.form__item}>
                <label htmlFor="username">お名前</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    placeholder="お名前を入力してください"
                    onChange={(e) => setUserName(e.target.value)}
                />
            </div>

            <div className={styles.form__item}>
                <label htmlFor="email">メールアドレス</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="メールアドレスを入力してください"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className={styles.form__item}>
                <label htmlFor="password">パスワード</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="パスワードを入力してください"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button type="submit" className={styles.form__btn}>新規登録</button>
        </form>
    );
};

export default Register;