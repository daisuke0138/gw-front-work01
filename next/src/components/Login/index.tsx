import React, { FormEvent, useState } from "react";
import styles from "./style.module.scss";
import apiClient from "@/lib/apiClient";
import router from "next/router";
import { useAuth } from "@/context/auth";

const Login = () => {
    // useState　各フォームの入力を保持します🤗
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // 呼び出し追記
    const { login } = useAuth();

    // 送信の処理を記述します🤗

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log(email);
        console.log(password);
        console.log(process.env.NEXT_PUBLIC_VERCEL_URL);
        console.log(process.env.NEXT_PUBLIC_API_BASEURL);
        // 追記 APIにデータを送りましょう！
        try {
            const response = await apiClient.post("/auth/login", {
                email,
                password,
            });
            const token = response.data.token;
            console.log(token);
            // ここで使用する
            login(token);

            alert("loginできました！");
            // ログインページに遷移します
            router.push("/");
        } catch (err) {
            console.log(err);
            alert("入力の何かが正しくありません！");
        }
    };
    return (
        <form className={styles.form}  onSubmit={handleSubmit}>
            <h3 className={styles.form__title}>ログイン</h3>

            <div className={styles.form__item}>
                <label htmlFor="">メールアドレス</label>
                <input
                    type="text"
                    value={email}
                    placeholder="メールアドレスを入力してください"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className={styles.form__item}>
                <label htmlFor="">パスワード</label>
                <input
                    type="text"
                    value={password}
                    placeholder="パスワードを入力してください"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button className={styles.form__btn}>ログイン</button>
        </form>
    );
};

export default Login;