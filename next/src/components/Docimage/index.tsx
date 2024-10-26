import React, { useState, useEffect } from 'react';
import apiClient from "@/lib/apiClient"
import { ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import { toRomaji } from 'wanakana';
import styles from "./style.module.scss";

// ファイル名imageNameをローマ字に変換して別の変数に格納
const convertToRomaji = (text: string): string => {
    return toRomaji(text);
};

const Docimage: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // const [kinds, setkinds] = useState<string>('');
    const [kinds, setkinds] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [preview, setPreview] = useState<string | null>(null);
    const [imageName, setimageName] = useState('');
    const [itemData, setItemData] = useState<Array<{
        name: string | undefined; img: string, title: string, author: string 
}>>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (kinds) {
                try {
                    const response = await apiClient.get('/auth/docimage', {
                        params: { kinds }
                    });
                    const data = response.data;

                    const formattedData = data.map((item: { imageUrl: string, imageName: string }) => ({
                        img: item.imageUrl,
                        name: item.imageName,
                    }));
                    setItemData(formattedData);
                } catch (error) {
                    console.error('データの取得に失敗しました', error);
                }
            }
        };
        fetchData();
    }, [kinds]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            // ファイル容量の制限 (2MB以下)
            if (file.size > 2 * 1024 * 1024) {
                alert("ファイルサイズが大きすぎます。2MB以下の画像を選択してください。");
                return;
            }

            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                // 画像サイズの制限 (1024x1024以下)
                if (img.width > 1024 || img.height > 1024) {
                    alert("画像サイズが大きすぎます。1024x1024以下の画像を選択してください。");
                    return;
                }

                setSelectedFile(file);

                // ファイルのプレビューを生成
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        };
    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedFile || !kinds || !imageName) {
            alert('すべてのフィールドを入力してください');
            return;
        }

        // imageName をローマ字に変換
        const romajiImageName = await convertToRomaji(imageName);

        const formData = new FormData();
        formData.append('file', selectedFile, `${romajiImageName}.${selectedFile.type.split('/')[1]}`);
        formData.append('kinds', kinds);
        formData.append('imageName', imageName);

        try {
            const response = await apiClient.post('/auth/imagecreat', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
                alert('イラストがdbに登録されました');
                console.log('ファイルが正常にアップロードされました', response.data);
        } catch (error) {
            console.error('ファイルのアップロードに失敗しました', error);
        }
    };

    return (
        <div className={styles.drawerContainer}>
            <section className={styles.section}>
                <h2 className={styles.title}>イラスト選択</h2>
                <div>
                    <select
                        className={styles.select}
                        value={kinds}
                        onChange={(e) => setkinds(e.target.value)}
                    >
                    <option value="">ジャンルを選択</option>
                    <option value="機構">機構</option>
                    <option value="電気">電気</option>
                    <option value="ソフト">ソフト</option>
                    <option value="other">other</option>
                    </select>
                </div>
                <ImageList className={styles.imageList} cols={3} rowHeight={120}>
                    {itemData.map((item) => (
                        <ImageListItem key={item.img}>
                            <img
                                src={item.img}
                                alt={item.name}
                                loading="lazy"
                                className={styles.docimage}
                            />
                            <ImageListItemBar title={item.name} className={styles.docimageBar} />
                        </ImageListItem>
                    ))}
                </ImageList>
                    <button className={`${styles.button} ${styles.buttonPrimary}`}>挿入</button>
            </section>

                <section className={styles.section}>
                    <h2 className={styles.title}>イラスト登録</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <select
                                className={styles.select}
                                value={kinds}
                                onChange={(e) => setkinds(e.target.value)}
                            >
                                <option value="">ジャンルを選択</option>
                                <option value="機構">機構</option>
                                <option value="電気">電気</option>
                                <option value="ソフト">ソフト</option>
                                <option value="other">other</option>
                            </select>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="ファイル名"
                                aria-label="ファイル名"
                                value={imageName}
                                onChange={(e) => setimageName(e.target.value)}
                            />
                        </div>
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input">
                            <span className={styles.button}>選択</span>
                        </label>
                        <button type="submit" className={styles.button}>登録</button>
                        {preview && (
                            <div className={styles.previewContainer}>
                                <img src={preview} alt="プレビュー" className={styles.previewImage} />
                            </div>
                        )}
                    </form>
                </section>
        </div>
    );
};
export default Docimage;