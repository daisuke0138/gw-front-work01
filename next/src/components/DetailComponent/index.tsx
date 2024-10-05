import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from "./style.module.scss";
import { Label } from "@radix-ui/react-label";

// Document インターフェースの定義
interface Document {
    id: string;
    title: string;
    theme: string;
    overview: string;
    results: string;
    updatedAt: string;
    objects: string;
}

// Shape インターフェースの定義
interface Shape {
    id: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    fill?: string;
    radius?: number;
    points?: number[];
    stroke?: string;
    strokeWidth?: number;
    rotation?: number;
    text?: string;
    fontSize?: number;
}

// DetailComponentProps インターフェースの定義
interface DetailComponentProps {
    document: Document | null;
    onClose: () => void;
}

// `react-konva` を動的にインポートし、SSR を無効にする
const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
const Rect = dynamic(() => import('react-konva').then(mod => mod.Rect), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => mod.Circle), { ssr: false });
const Line = dynamic(() => import('react-konva').then(mod => mod.Line), { ssr: false });
const Text = dynamic(() => import('react-konva').then(mod => mod.Text), { ssr: false });

const DetailComponent: React.FC<DetailComponentProps> = ({ document, onClose }) => {
    const [shapes, setShapes] = useState<Shape[]>([]);

    useEffect(() => {
        if (document) {
            const objects = JSON.parse(document.objects);
            setShapes(objects);
        }
    }, [document]);

    if (!document) {
        return null;
    }

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
                                    {shapes.map((obj: Shape, index: number) => {
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
                                            case 'Text':
                                                return (
                                                    <Text
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