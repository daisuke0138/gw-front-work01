import apiClient from "@/lib/apiClient";
import React, { ReactNode, useContext, useEffect } from "react";

// 認証コンテキストが提供する関数の型を定義
// login: トークンを受け取り、認証情報を設定する関数
interface AuthContextType {
    login: (token: string) => void;
    logout: () => void;
}

// childrenのReactNode＝ReactコンポーネントやHTMLの要素など、Reactで使うことができるもの
// AuthProviderProps: childrenをAuthProviderに入れるルール(props)のこと
interface AuthProviderProps {
    children: ReactNode;
}

//AuthContext は、認証情報を共有するためのコンテキストを作成
// React.createContext<AuthContextType>: AuthContextType 型のデフォルト値を持つコンテキストを作成
// デフォルト値として、空の login 関数と logout 関数を設定
// const AuthProvider が実行されることでAuthContextが作成され、その中にloginとlogoutが入る
const AuthContext = React.createContext<AuthContextType>({
    login: () => { },
    logout: () => { },
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const login = async (token: string) => {
        console.log(token, "token");
        window.localStorage.setItem("auth_token", token);
        // ログイン時に Authorization ヘッダーにBearer ${token}を自動的に追加
        apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        delete apiClient.defaults.headers["Authorication"];
    };

    // ページがリロードされたり、アプリケーションが再起動されたときに、
    // ローカルストレージからトークンを取得し、APIクライアントのヘッダーにearer ${token}を再設定
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;
        }
    }, []);

    const value = {
        login,
        logout,
    };
    //useEffectで定義しているので、src\pages\_app.tsxの<AppProvider>に渡すことで、
    // 全てのページでトークンによる認証情報を共有できる
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};