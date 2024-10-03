import React from 'react';
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss";

interface Document {
    id: string;
    title: string;
    theme: string;
    overview: string;
    results: string;
    updatedAt: string;
    objects: string;
}

interface DetailComponentProps {
    document: Document;
    onClose: () => void;
}

const DetailComponent: React.FC<DetailComponentProps> = ({ document, onClose }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>業務活動報告</h2>
                </div>
                <div className={styles.detailContainer}>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <Label htmlFor="created_at" className={styles.label}>作成日</Label>
                            <p id="created_at" className={styles.content}>
                                {new Date(document.updatedAt).toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="theme" className={styles.label}>テーマ</Label>
                        <p id="theme" className={styles.content}>{document.theme}</p>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="summary" className={styles.label}>概要</Label>
                        <p id="summary" className={styles.content}>{document.overview}</p>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="results" className={styles.label}>成果</Label>
                        <p id="results" className={styles.content}>{document.results}</p>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="canvas" className={styles.label}>キャンバスデータ</Label>
                        <div id="canvas" className={styles.canvasContainer}>
                            <p className={styles.placeholder}>キャンバスデータ: {document.objects}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailComponent;