import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'
import { Loader2 } from 'lucide-react'
import Button from '@mui/material/Button';
import apiClient from "@/lib/apiClient"
import { Input, TextareaAutosize } from '@mui/material';
import { Label } from '@radix-ui/react-label';
import styles from "./style.module.scss"

// import { Camera, Loader2 } from 'lucide-react'

interface Userdata {
  id: number;
  username: string;
  email: string;
  password: string;
  number: string | null;
  profile_image: string | null;
  department: string | null;
  classification: string | null;
  hoby: string | null;
  business_experience: string | null;
}

const Useredit: React.FC = () => {
  // データ受信用の状態変数
  const [formData, setFormData] = useState<Userdata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // データ送信用の状態変数
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ルーターの設定
  const router = useRouter();

  // ユーザーデータを取得します
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login'); // トークンがない場合はログインページにリダイレクト
        return;
      }
      try {
      const response = await apiClient.get('/auth/user', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      console.log('Raw API response:', response.data);
        setFormData(response.data.formData);
        if (response.data.profile_image) {
          setPreviewUrl(response.data.profile_image)
        }
      } catch (error: unknown) {
        console.error('Failed to fetch user:', error);
        if (error instanceof Error && (error as { response?: { status: number } }).response?.status === 401) {
          router.push('/login');
        }
      }
      };

      fetchUserData();

        return () => {
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
        };
      }, [router, previewUrl]);

      
  // // フォームデータで変更したname(カラム)とデータを取得します
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData!,
      [name]: value,
    }))
    setError(null)
  }

  // // ファイルサイズ変更、データ量圧縮、プレビュー用URLの生成を行います
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("ファイルサイズが大きすぎます。2MB以下の画像を選択してください。")
        return
      }
      try {
        const objectUrl = URL.createObjectURL(file)
        setPreviewUrl(objectUrl)
        setSelectedImage(file)
      } catch (error) {
        console.error("Error processing image:", error)
        setError("画像の処理中にエラーが発生しました。別の画像を試してください。")
      }
    }
  }

  // フォーム形式で編集プロフィールと画像ファイルを送信します
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData) return

    setIsLoading(true)

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })

    if (selectedImage) {
      const fileName = `${formData.id}_${formData.username}_${formData.number}`
      formDataToSend.append('profile_image', selectedImage, fileName)
    }

    try {
      const response = await apiClient.post("/auth/useredit", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      console.log("User data updated successfully:", response.data)
      router.push("/profile")
    } catch (error) {
      console.error("Error updating user data:", error)
      setError("プロフィールの更新中にエラーが発生しました。もう一度お試しください。")
    } finally {
      setIsLoading(false)
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
              <p className={styles.info}>社員番号: {formData?.number ? formData.number : 'Loading...'}</p>
            </>
          )}
          <Button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? (
              <>
                <Loader2 className={styles.spinner} />
                更新中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.grid}>
          <div className={styles.imageUpload}>
            <Label htmlFor="profile-image">プロフィール画像</Label>
            <div className={styles.imagePreview}>
              {/* <img
                src={previewUrl || "/placeholder.svg"}

                className={styles.previewImage}
              /> */}
              <Label
                htmlFor="file-upload"
                className={styles.uploadButton}
              >
                {/* <Camera className={styles.cameraIcon} />
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className={styles.fileInput}
                  accept="image/*"
                  onChange={handleImageChange}
                /> */}
              </Label>
            </div>
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