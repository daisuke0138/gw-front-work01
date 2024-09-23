import apiClient from "@/lib/apiClient";
import { useRouter } from "next/router";
import { useAuth } from "@/context/auth";
import styles from "./style.module.scss";
import { FormEvent } from 'react';

const Logout = () => {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await apiClient.post("/auth/logout");
            logout(); // ログアウト処理を呼び出し
            alert("ログアウトが成功しました！");
            router.push("/login"); // ログインページにリダイレクト
        }
        catch (err) {
            console.error(err);
            alert("ログアウトが失敗しました！");
        }
    }

    return (
        <form className={styles.form} onSubmit={handleLogout}>
            <h3 className={styles.form__title}>ログアウト</h3>
            <button type="submit" className={styles.form__btn}>ログアウト</button>
        </form>
    );
};

export default Logout;