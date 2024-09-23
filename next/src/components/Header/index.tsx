import React from "react";
import styles from "./style.module.scss";
import Link from "next/link";

const Header = () => {
    return (
        <header className={styles.header}>
            <ul>
                <h1>Knowledge sharing room</h1>
                <Link href={"/"}>Menber List</Link>
                <Link href={"/user"}>My Profile</Link>
                <Link href={"/doc"}>Document creat</Link>
            </ul>
            <ul>
                <li>
                    <Link href={"/login"}>Login</Link>
                </li>
                <li>
                    <Link href={"/logout"}>Logout</Link>
                </li>
                <li>
                    <Link href={"/register"}>Register</Link>
                </li>
            </ul>
        </header>
    );
};

export default Header;