import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/apiClient";
import Link from "next/link";
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss";
import DetailComponent from "@/components/DetailComponent"; // Adjust the path as necessary

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

interface Document {
    id: string;
    title: string;
    theme: string;
    overview: string;
    results: string;
    updatedAt: string;
    objects: string;
    userId: number
}

const User: React.FC = () => {
    const [user, setUser] = useState<Userdata | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

    const router = useRouter();

    // ユーザー情報とドキュメント情報をapiサーバーより取得
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

                // ここでドキュメントも取得します。
                const docResponse = await apiClient.get('/auth/documents'); 
                
                console.log("docResponse.data", docResponse.data);

                // docResponse.data が配列であることの確認
                const documentsData: Document[] = docResponse.data.documents.map((documentData: any) => ({
                    id: documentData.id,
                    title: documentData.title,
                    theme: documentData.theme,
                    updatedAt: documentData.updatedAt,
                    overview: documentData.overview,
                    results: documentData.results,
                    objects: documentData.objects,
                    userId: documentData.userId,
                }));

                setDocuments(documentsData);

            } catch (error: unknown) {
                console.error('Failed to fetch user:', error);
                if (error instanceof Error && (error as { response?: { status: number } }).response?.status === 401) {
                    router.push('/login'); 
                }
            }
        };
        fetchUser();
    }, [router]);


    const handleDocumentSelect = (doc: Document) => {
        setSelectedDoc(doc);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDoc(null);
    };

    if (!user) {
        return <div>Loading...</div>;
    }

        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>My Page</h2>
                    <Link className={styles.info} href={`/useredit`}>Edit</Link>
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
                        </div>
                    </div>  
                    <div>
                        <Label htmlFor="username">氏名</Label>
                        <p className={styles.p}>{user.username}
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="number">社員番号</Label>
                        <p className={styles.p}>{user.number}</p>
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
                    <div className={styles.documentSection}>
                    <h2 className={styles.subtitle}>Knowledge</h2>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.tableHeader}>タイトル</th>
                                <th className={styles.tableHeader}>テーマ</th>
                                <th className={styles.tableHeader}>日付</th>
                                <th className={styles.tableHeader}>ドキュメント</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents && documents.length > 0 ? ( // documents が存在するか確認
                                documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>{doc.title}</td>
                                        <td>{doc.theme}</td>
                                        <td>{new Date(doc.updatedAt).toLocaleDateString()}</td>
                                        <td>
                                            <button
                                                className={styles.detailButton}
                                                onClick={() => handleDocumentSelect(doc)}
                                            >
                                                詳細表示
                                                
                                            </button>
                                            <button
                                                className={styles.detailButton}
                                                onClick={() => router.push(`/docedit?document=${doc.id}`)}
                                            >
                                                編集

                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4}>ドキュメントがありません</td>
                                </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            
                {isModalOpen && selectedDoc && (
                    <div className={styles.modalOverlay} onClick={handleCloseModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
                            <DetailComponent
                                document={selectedDoc}
                                onClose={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        )
};
export default User
