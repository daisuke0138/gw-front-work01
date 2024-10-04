import apiClient from "@/lib/apiClient";
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import {
    SquareIcon,
    CircleIcon,
    MinusIcon,
    ArrowRightIcon,
    TypeIcon,
    LayoutPanelLeftIcon,
    ImageIcon,
    Palette,
    EraserIcon,
    Save,
    Send
} from 'lucide-react';
import styles from "./style.module.scss";
import { Label } from "@radix-ui/react-label";
import Konva from "konva";

// ドキュメントデータの型定義。初回作成時には空のデータを格納。
type Shape = {
    type: "Rect" | "Circle" | "Line";
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    fill?: string;
    points?: number[];
    stroke?: string;
    strokeWidth?: number;
};

// interface Document {
//     id: string;
//     title: string;
//     theme: string;
//     overview: string;
//     results: string;
//     updatedAt: string;
//     objects: string;
// }

// `react-konva` を動的にインポートし、SSR を無効にする
const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
const Rect = dynamic(() => import('react-konva').then(mod => mod.Rect), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => mod.Circle), { ssr: false });
const Line = dynamic(() => import('react-konva').then(mod => mod.Line), { ssr: false });

const Docedit: React.FC = () => {
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [overview, setOverview] = useState('');
    const [results, setResults] = useState('');
    const [selectedTool, setSelectedTool] = useState('');
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [stageSize, setStageSize] = useState({ width: 0, height: 500 });
    const router = useRouter();

    // userデータを取得 
    const [userData, setUserData] = useState({ id: '', username: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login'); // トークンがない場合はログインページにリダイレクト
                return;
            }
            console.log('auth_token', localStorage.getItem('auth_token'));
            try {
                const response = await apiClient.get('/auth/user', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    },
                });
                setUserData(response.data.user); // レスポンスの構造に合わせて修正
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [router]);

    console.log('userdata', userData);

    // 編集選択されたドキュメントデータを取得
    useEffect(() => {

        const fetchDocument = async () => {
            const { document: id } = router.query;

            if (!router.isReady || !id) {
            
            return; // ルーターが準備できていない場合は何もしない
            };
        

            const apiUrl = `/auth/document/${id}`;

            try {
                const response = await apiClient.get(apiUrl, {
                    // headers: {
                    //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                    // },
                });
                console.log('document data:', response.data); // ここでレスポンスデータをコンソールに表示
                const document = response.data.document;
                setTitle(document.title);
                setTheme(document.theme);
                setOverview(document.overview);
                setResults(document.results);
                setShapes(JSON.parse(document.objects));
            } catch (error: unknown) {
                console.error('Failed to fetch document:', error);
            }
        };

        fetchDocument();
    }, [router.isReady, router.query]);

    // ローカルストレージにドキュメントデータを一時保存
    const handleSave = () => {
        const data = {
            title,
            theme,
            overview,
            results,
            shapes,
        };
        localStorage.setItem('documentData', JSON.stringify(data));
        alert('データを一時保存しました');
    };

    // ローカルストレージのjsonデータを読み込み。画面リロード時にデータを復元
    const loadFromLocalStorage = () => {
        const savedData = localStorage.getItem('documentData');
        if (savedData) {
            const data = JSON.parse(savedData);
            setTitle(data.title);
            setTheme(data.theme);
            setOverview(data.overview);
            setResults(data.results);
            setShapes(data.shapes);
        }
    };

    useEffect(() => {
        loadFromLocalStorage();
    }, []);

    // APIサーバーに送信するデータを格納
    const senddocData = () => {
        const { document: id } = router.query;
        return {
            documentId: id,
            title,
            theme,
            overview,
            results,
            objects: shapes,
        };
    };

    // APIサーバーにデータを送信
    const handleSend = async () => {
        const data = senddocData();
        try {
            await apiClient.post("/auth/docupdata", data);
            alert('データがdbに保存されました');

            // ローカルストレージのデータを削除
            localStorage.removeItem('documentData');

            // 画面遷移
            router.push('/user');

        } catch (error) {
            console.error('Error saving data to database:', error);
            alert('データの保存に失敗しました');
        }
    };

    // 画面サイズの変更を検知してキャンバスのサイズを更新
    useEffect(() => {
        const updateSize = () => {
            setStageSize({ width: window.innerWidth * 0.9 - 48, height: 500 });
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const tools = [
        { name: 'square', icon: SquareIcon, tooltip: '四角' },
        { name: 'circle', icon: CircleIcon, tooltip: '丸' },
        { name: 'line', icon: MinusIcon, tooltip: '直線' },
        { name: 'arrow', icon: ArrowRightIcon, tooltip: '矢印' },
        { name: 'text', icon: TypeIcon, tooltip: 'テキストボックス' },
        { name: 'panel', icon: LayoutPanelLeftIcon, tooltip: '結合' },
        { name: 'image', icon: ImageIcon, tooltip: 'イラスト挿入' },
        { name: 'color', icon: Palette, tooltip: 'colerパレット' },
        { name: 'eraser', icon: EraserIcon, tooltip: '削除' },
    ];

    const handleToolSelect = (toolName: string) => {
        setSelectedTool(toolName);
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => { // 型を指定
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        let newShape: Shape;

        switch (selectedTool) {
            case 'square':
                newShape = {
                    type: 'Rect',
                    x: pos.x,
                    y: pos.y,
                    width: 50,
                    height: 50,
                    fill: 'red',
                };
                break;
            case 'circle':
                newShape = {
                    type: 'Circle',
                    x: pos.x,
                    y: pos.y,
                    radius: 25,
                    fill: 'blue',
                };
                break;
            case 'line':
                newShape = {
                    type: 'Line',
                    x: pos.x,
                    y: pos.y,
                    points: [pos.x, pos.y, pos.x + 50, pos.y + 50],
                    stroke: 'green',
                    strokeWidth: 2,
                };
                break;
            default:
                return;
        }
        setShapes([...shapes, newShape]);
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <div className={styles.toolButtons}>
                    {tools.map((tool) => (
                        <button
                            key={tool.name}
                            onClick={() => handleToolSelect(tool.name)}
                            className={`${styles.toolButton} ${selectedTool === tool.name ? styles.selected : ''}`}
                            title={tool.tooltip}
                        >
                            <tool.icon className={styles.icon} />
                        </button>
                    ))}
                </div>
                <div className={styles.actionButtons}>
                    <Link className={styles.info} href={`/user`}>My Pageへ</Link>
                    <button onClick={handleSave} className={styles.actionButton} title="保存">
                        <Save className={styles.icon} />
                    </button>
                    <button onClick={handleSend} className={styles.actionButton} title="送信">
                        <Send className={styles.icon} />
                    </button>
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.formGrid}>
                    <div className={styles.username}>
                        <Label htmlFor="username">氏名</Label>
                        <p className={styles.p}>{userData.username}</p>
                    </div>
                    <input
                        type="text"
                        placeholder="作成日"
                        value={new Date().toLocaleDateString()}
                        readOnly
                        className={`${styles.input} ${styles.readonly}`}
                    />
                    <select
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                    >
                        <option value="" disabled>タイトルを選択してください</option>
                        <option value="23年度成果報告">23年度成果報告</option>
                        <option value="24年度成果報告">24年度成果報告</option>
                        <option value="業務活動報告">業務活動報告</option>
                    </select>
                    <input
                        type="text"
                        placeholder="テーマ"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className={styles.input}
                    />
                    <textarea
                        placeholder="概要"
                        value={overview}
                        onChange={(e) => setOverview(e.target.value)}
                        className={styles.textarea}
                        rows={2}
                    />
                    <textarea
                        placeholder="成果"
                        value={results}
                        onChange={(e) => setResults(e.target.value)}
                        className={styles.textarea}
                        rows={2}
                    />
                </div>
                <div id="canvas-container" className={styles.canvasContainer}>
                    <Stage width={stageSize.width} height={stageSize.height} onClick={handleStageClick}>
                        <Layer>
                            {shapes.map((shape, i) => {
                                switch (shape.type) {
                                    case 'Rect':
                                        return <Rect key={i} {...shape} />;
                                    case 'Circle':
                                        return <Circle key={i} {...shape} />;
                                    case 'Line':
                                        return <Line key={i} {...shape} />;
                                    default:
                                        return null;
                                }
                            })}
                        </Layer>
                    </Stage>
                </div>
            </div>
        </div>
    );
};

export default Docedit;