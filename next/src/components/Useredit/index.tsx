import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Camera} from 'lucide-react'
import Button from '@mui/material/Button';
import apiClient from "@/lib/apiClient"
import { Input, TextareaAutosize } from '@mui/material';
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss"

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

const Useredit: React.FC = () => {
  // getでデータ受信後のpostで送信用に状態変化する
  const [formData, setFormData] = useState<Userdata | null>(null);

  // プレビュー画像用の状態変数
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // エラーメッセージ用の状態変数
  const [error, setError] = useState<string | null>(null);

  // データ送信用の状態変数
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // ルーターの設定
  const router = useRouter();

  // ユーザーデータを取得します
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login'); // トークンがない場合はログインページにリダイレクト
        return;
      }
      try {
        const response = await apiClient.get('/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFormData(response.data.user); // レスポンスの構造に合わせて修正
      } catch (error: unknown) {
        console.error('Failed to fetch user:', error);
        if (error instanceof Error && (error as { response?: { status: number } }).response?.status === 401) {
          router.push('/login');
        }
      }
    };
    fetchUser();
  }, [router]);

      
  //handleChangeは、inputタグやtextareaタグの値が変更されたときに呼び出しています。
  //e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement は取得する変更された要素を指定。
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

    //formで定義したname=** と value=** を取得します
    const { name, value } = e.target

    //prevDataはdbから取得したデータで、nameとvalueを更新します。
    setFormData((prevData) => ({
      ...prevData!,
      [name]: value,
    }))
    setError(null)
  }

  // // ファイルサイズ変更、データ量圧縮、プレビュー用URLの生成を行います
  // inputタグへファイルが追加されて時にhandleImageChangeが呼び出されます
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("ファイルサイズが大きすぎます。2MB以下の画像を選択してください。")
        return
      }
      // プレビュー用URLを生成します
      try {
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)

        // 選択された画像ファイルを送信用にsetSelectedImageへ状態変更
        setSelectedImage(file)
      } catch (error) {
        console.error("Error processing image:", error)
        setError("画像の処理中にエラーが発生しました。別の画像を試してください。")
      }
    }
  }
  console.log("preview image:", selectedImage)
  // フォーム形式で編集プロフィールと画像ファイルを送信します
  // フォームが送信時のページリロードを防止
  // ボタンを押すと=handleSubmitが実行され、全送信データがformDataToSendに格納されます
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
    //formDataがない場合は関数処理を終了します
    if (!formData) return


    //new Form Dataへ setFormDataでformDataに格納したkey: username、value: exampleUserをすべて追加します
    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })

    // 画像が選択されて場合、formDataToSendにkey=profile_image
    // value=selectedImageとして画像ファイル、そのファイル名=fileNameとして
    // form送信するformDataToSendに追加
    if (selectedImage) {
      const fileName = `${formData.id}_${formData.number}`

      console.log("Generated file name:", fileName)
      formDataToSend.append('profile_image', selectedImage, fileName)
    }

    console.log("Selected image:",formDataToSend)
    //apiclientを介してformDataToSendをサーバーへ送信します

    try {
      const response = await apiClient.post("/auth/useredit", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      alert('データを保存しました');
      console.log("User data updated successfully:", response.data)
      router.push("/user")
    } catch (error) {
      console.error("Error updating user data:", error)
      alert('データの保存に失敗しました');
    } 
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.header}>
          <h2 className={styles.title}>My Profile</h2>
          {formData && (
            <>
              <p className={styles.info}>氏名: {formData?.username ? formData.username : 'Loading...'}</p>
            </>
          )}
          <Button type="submit" className={styles.submitButton}>
          保存
          </Button>
        </div>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.grid}>
          <div className={styles.imageUpload}>
            <Label htmlFor="profile-image">プロフィール画像</Label>
            <div className={styles.imagePreview}>
              <img
                src={previewUrl || "/placeholder.svg"}

                className={styles.previewImage}
              />
              <Label
                htmlFor="file-upload"
                className={styles.uploadButton}
              >
                <Camera className={styles.cameraIcon} />
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className={styles.fileInput}
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Label>
            </div>
          </div>
          <div>
            <Label htmlFor="number">社員番号</Label>
            <Input
              id="number"
              name="number"
              value={formData?.number || ''}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div>
            <Label htmlFor="department">部署</Label>
            <Input
              id="department"
              name="department"
              value={formData?.department || ''}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div>
            <Label htmlFor="classification">職能</Label>
            <Input
              id="classification"
              name="classification"
              value={formData?.classification || ''}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div>
            <Label htmlFor="hoby">趣味</Label>
            <Input
              id="hoby"
              name="hoby"
              value={formData?.hoby || ''}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.fullWidth}>
            <Label htmlFor="business_experience">業務経験</Label>
            <TextareaAutosize
              id="business_experience"
              name="business_experience"
              value={formData?.business_experience || ''}
              onChange={handleChange}
              minRows={4}
              className={styles.textarea}
            />
          </div>
        </div>
      </form>
    </div>
  )
};
export default Useredit;