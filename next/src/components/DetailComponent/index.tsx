import React from 'react';
import { Stage, Layer, Rect, Circle, Line } from 'react-konva';
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss";
import Link from 'next/link';
// import { useRouter } from 'next/router';


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
    // const router = useRouter();
    const objects = JSON.parse(document.objects);


    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Document 詳細</h2>
                </div>
                <div className={styles.detailContainer}>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailItem}>
                            <Label htmlFor="updatedAt" className={styles.label}>作成日</Label>
                            <p id="updatedAt" className={styles.content}>
                                {new Date(document.updatedAt).toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="theme" className={styles.label}>テーマ</Label>
                        <p id="theme" className={styles.content}>{document.theme}</p>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="overview" className={styles.label}>概要</Label>
                        <p id="overview" className={styles.content}>{document.overview}</p>
                    </div>

                    <div className={styles.detailItem}>
                        <Label htmlFor="results" className={styles.label}>成果</Label>
                        <p id="results" className={styles.content}>{document.results}</p>
                    </div>

                        <div className={styles.detailItem}>
                            <label htmlFor="canvas" className={styles.label}>報告内容</label>
                            <div id="canvas" className={styles.canvasContainer}>
                                <Stage width={800} height={600}>
                                    <Layer>
                                        {objects.map((obj: any, index: number) => {
                                            switch (obj.type) {
                                                case 'Rect':
                                                    return (
                                                        <Rect
                                                            key={index}
                                                            x={obj.x}
                                                            y={obj.y}
                                                            width={obj.width}
                                                            height={obj.height}
                                                            fill={obj.fill}
                                                            draggable={false} // 編集不可
                                                        />
                                                    );
                                                case 'Circle':
                                                    return (
                                                        <Circle
                                                            key={index}
                                                            x={obj.x}
                                                            y={obj.y}
                                                            radius={obj.radius}
                                                            fill={obj.fill}
                                                            draggable={false} // 編集不可
                                                        />
                                                    );
                                                case 'Line':
                                                    return (
                                                        <Line
                                                            key={index}
                                                            points={obj.points}
                                                            stroke={obj.stroke}
                                                            strokeWidth={obj.strokeWidth}
                                                            draggable={false} // 編集不可
                                                        />
                                                    );
                                                default:
                                                    return null;
                                            }
                                        })}
                                    </Layer>
                                </Stage>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default DetailComponent;