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

// `react-konva` を動的にインポートし、SSR を無効にする
const Stage = dynamic(() => import('react-konva').then(mod => mod.Stage), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => mod.Layer), { ssr: false });
const Rect = dynamic(() => import('react-konva').then(mod => mod.Rect), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => mod.Circle), { ssr: false });
const Line = dynamic(() => import('react-konva').then(mod => mod.Line), { ssr: false });
const Text = dynamic(() => import('react-konva').then(mod => mod.Text), { ssr: false });

const Doc: React.FC = () => {
    const [title, setTitle] = useState('');
    const [theme, setTheme] = useState('');
    const [overview, setOverview] = useState('');
    const [results, setResults] = useState('');
    const [selectedTool, setSelectedTool] = useState('');
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [stageSize, setStageSize] = useState({ width: 0, height: 500 });
    const router = useRouter();
    const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>('');

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
        return {
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
            await apiClient.post("/auth/doc", data);
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

    // オブジェクトの定義
    const handleToolSelect = (toolName: string) => {
        setSelectedTool(toolName);
        if (toolName === 'eraser') {
            setSelectedShapeId(null);
        }
    };

    const handleShapeClick = (id: string, type: string, text: string) => {
        if (selectedTool === 'eraser') {
            setShapes(shapes.filter(shape => shape.id !== id));
        } else if (type === 'Text') {
            setEditingTextId(id);
            setEditingText(text);
        } else {
            setSelectedShapeId(id);
        }
    };

    // const handleTextClick = (id: string, text: string) => {
    //     if (selectedTool === 'eraser') {
    //         setShapes(shapes.filter(shape => shape.id !== id));
    //     } else {
    //         setEditingTextId(id);
    //         setEditingText(text);
    //     }
    // };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingText(e.target.value);
    };

    const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && editingTextId) {
            const newShapes = shapes.map((shape) => {
                if (shape.id === editingTextId) {
                    return {
                        ...shape,
                        text: editingText,
                    };
                }
                return shape;
            });
            setShapes(newShapes);
            setEditingTextId(null);
            setEditingText('');
        }
    };
    // ツールボタンがクリックされたときに、選択されたツールの名前を selectedTool ステートに設定。
    // キャンバス上でクリックした位置に図形を挿入するための関数。
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (editingTextId) {
            // 編集中のテキストがある場合は新規追加を行わない
            return;
        }

        // クリックした位置を取得
        const pos = e.target.getStage()?.getPointerPosition();
        if (!pos) return;
        let newShape: Shape;
        // 各図形の初期形状を定義
        // id:は図形の識別子、配置図数が増えるとid+1される
        switch (selectedTool) {
            case 'square':
                newShape = {
                    id: `rect-${shapes.length + 1}`,
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
                    id: `Circle-${shapes.length + 1}`,
                    type: 'Circle',
                    x: pos.x,
                    y: pos.y,
                    radius: 25,
                    fill: 'blue',
                };
                break;
            case 'line':
                newShape = {
                    id: `Line-${shapes.length + 1}`,
                    type: 'Line',
                    x: pos.x,
                    y: pos.y,
                    points: [pos.x, pos.y, pos.x + 50, pos.y + 50],
                    stroke: 'green',
                    strokeWidth: 2,
                };
                break;
            case 'text':
                newShape = {
                    id: `Text-${shapes.length + 1}`,
                    type: 'Text',
                    x: pos.x,
                    y: pos.y,
                    text: 'テキスト',
                    fontSize: 20,
                    fill: 'black',
                };
                break;
            default:
                return;
        }
        setShapes([...shapes, newShape]);
    };
    
        // 図形のマウスドラッグ終了時に、図形の位置を更新
        const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
            const newShapes = shapes.map((shape) => {
                if (shape.id === id) {
                    return {
                        ...shape,
                        x: e.target.x(),
                        y: e.target.y(),
                    };
                }
                return shape;
            });
            setShapes(newShapes);
        };

        //図名の形状変更リサイズ、回転のドラッグ終了時に図形の位置を更新   
        const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
            const node = e.target;
            const newShapes = shapes.map((shape) => {
                if (shape.id === id) {
                    return {
                        ...shape,
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        rotation: node.rotation(),
                    };
                }
                return shape;
            });
            setShapes(newShapes);
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
                                {shapes.map((shape) => {
                                    // {shapes.map((shape, i) => {
                                    switch (shape.type) {
                                        case 'Rect':
                                            return (
                                                <Rect
                                                    key={shape.id}
                                                    x={shape.x}
                                                    y={shape.y}
                                                    width={shape.width}
                                                    height={shape.height}
                                                    fill={shape.fill}
                                                    draggable
                                                    onClick={() => handleShapeClick(shape.id, shape.type, shape.text || '')}
                                                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                                                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                                                    rotation={shape.rotation}
                                                    ref={(node) => {
                                                        if (selectedShapeId === shape.id && node instanceof Konva.Node) {
                                                            const tr = new Konva.Transformer();
                                                            node.getLayer()?.add(tr);
                                                            tr.attachTo(node);
                                                            node.getLayer()?.batchDraw();
                                                        }
                                                    }}
                                                />
                                            );
                                        case 'Circle':
                                            return (
                                                <Circle
                                                    key={shape.id}
                                                    x={shape.x}
                                                    y={shape.y}
                                                    radius={shape.radius}
                                                    fill={shape.fill}
                                                    draggable
                                                    onClick={() => handleShapeClick(shape.id, shape.type, shape.text || '')}
                                                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                                                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                                                    rotation={shape.rotation}
                                                    ref={(node) => {
                                                        if (selectedShapeId === shape.id && node instanceof Konva.Node) {
                                                            const tr = new Konva.Transformer();
                                                            node.getLayer()?.add(tr);
                                                            tr.attachTo(node);
                                                            node.getLayer()?.batchDraw();
                                                        }
                                                    }}
                                                />
                                            );
                                        case 'Line':
                                            return (
                                                <Line
                                                    key={shape.id}
                                                    points={shape.points}
                                                    stroke={shape.stroke}
                                                    strokeWidth={shape.strokeWidth}
                                                    draggable
                                                    onClick={() => handleShapeClick(shape.id, shape.type, shape.text || '')}
                                                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                                                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                                                    ref={(node) => {
                                                        if (selectedShapeId === shape.id && node instanceof Konva.Node) {
                                                            const tr = new Konva.Transformer();
                                                            node.getLayer()?.add(tr);
                                                            tr.attachTo(node);
                                                            node.getLayer()?.batchDraw();
                                                        }
                                                    }}
                                                />
                                            );
                                        case 'Text':
                                            return (
                                                <Text
                                                    key={shape.id}
                                                    x={shape.x}
                                                    y={shape.y}
                                                    text={editingTextId === shape.id ? editingText : shape.text}
                                                    fontSize={shape.fontSize}
                                                    fill={shape.fill}
                                                    draggable
                                                    onClick={() => handleShapeClick(shape.id, shape.type, shape.text || '')}
                                                    onDragEnd={(e) => handleDragEnd(e, shape.id)}
                                                    onTransformEnd={(e) => handleTransformEnd(e, shape.id)}
                                                    ref={(node) => {
                                                        if (selectedShapeId === shape.id && node instanceof Konva.Node) {
                                                            const tr = new Konva.Transformer();
                                                            node.getLayer()?.add(tr);
                                                            tr.attachTo(node);
                                                            node.getLayer()?.batchDraw();
                                                        }
                                                    }}
                                                />
                                            );
                                        default:
                                            return null;
                                    }
                                })}
                            </Layer>
                        </Stage>
                        {editingTextId && (
                            <input
                                type="text"
                                value={editingText}
                                onChange={handleTextChange}
                                onKeyDown={handleTextSubmit}
                                style={{
                                    position: 'absolute',
                                    top: `${shapes.find(shape => shape.id === editingTextId)?.y || 0}px`,
                                    left: `${shapes.find(shape => shape.id === editingTextId)?.x || 0}px`,
                                    transform: 'translate(0%,0%)',
                                    fontSize: '20px',
                                    zIndex: 10,
                                    backgroundColor: 'white', // 背景色を設定して見やすくする
                                    border: '1px solid black', // 枠線を設定して見やすくする
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    
};

export default Doc;