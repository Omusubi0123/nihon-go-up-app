import {
  Button,
  VStack,
  HStack,
  Box,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Center,
  Image,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';

export default function Mvp2() {
  const { isOpen: isOpenModal1, onOpen: onOpenModal1, onClose: onCloseModal1 } = useDisclosure(); // モーダルの制御
  const { isOpen: isOpenModal2, onOpen: onOpenModal2, onClose: onCloseModal2 } = useDisclosure(); // モーダルの制御
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const [imageSrc, setImageSrc] = useState<string | null>(null); // 画像のURLを格納
  const [componentImageSrc, setComponentImageSrc] = useState<string | null>(null); // 画像のURLを格納
  const [imageExtension, setImageExtension] = useState<string | null>(null); // 画像の拡張子を格納
  const inputFileRef = useRef<HTMLInputElement | null>(null); // ファイル選択の参照

  // 画像データをBase64形式に変換する関数
  const convertImageToBase64 = (imageSrc: string, callback: (base64String: string) => void) => {
    const img = new window.Image(); // ブラウザの組み込みImageオブジェクトを使用
    img.src = imageSrc;
    
    img.onload = () => {
      // Canvasを作成して画像を描画
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Base64形式に変換
        const base64String = canvas.toDataURL('image/png');
        callback(base64String);
      }
    };
  };

  const handleModalSubmit = async () => {
    try {
      if (componentImageSrc) {
        convertImageToBase64(componentImageSrc, async (base64String) => {
          const formData = new FormData();
          formData.append('image', base64String);
          console.log(typeof(formData.get('image')));
          console.log(formData.get('image'));
          formData.append('text', inputText);

          const apiResponse = await fetch(import.meta.env.VITE_FASTAPI_URL + 'descript/', {
            method: 'POST',
            body: JSON.stringify({
              b64_image_data: base64String,
              // text: inputText
              extension: imageExtension
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!apiResponse.ok) {
            throw new Error(`HTTP error! status: ${apiResponse.status}`);
          }

          const result = await apiResponse.json();
          console.log('Success:', result);

          setImageSrc(componentImageSrc);
          onClose();
        });
      } else {
        console.error('No image selected.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageExtension(file.name.split('.').pop());
      const reader = new FileReader();
      reader.onloadend = () => {
        setComponentImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  return (
    <HStack spacing={0} align="stretch" height="100vh">
      <VStack
        w="250px"
        p={4}
        bg="gray.100"
        align="start"
        spacing={4}
      >
        {/* 隠れたファイル選択ボタン */}
        <input
          type="file"
          accept="image/*"
          ref={inputFileRef}
          style={{ display: 'none' }} // inputを非表示にする
          onChange={handleFileChange}
        />
        <Button width="100%" colorScheme="blue" size="lg" onClick={onOpenModal1}>
          画像説明モード1
        </Button>
        <Button width="100%" colorScheme="blue" size="lg" onClick={onOpenModal2}>
          画像説明モード2
        </Button>
      </VStack>
      <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
        {imageSrc && (
          <Box flex="1" p={4}>
            <Image src={imageSrc} alt="Uploaded Image" maxH="300px" objectFit="contain" />
          </Box>
        )}
      </VStack>
      {/* モーダル1 */}
      <Modal isOpen={isOpenModal1} onClose={onCloseModal1}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>画像を選択してください</ModalHeader>
          <ModalBody>
            <Center>
              <Button width="90%" colorScheme="blue" onClick={handleUploadClick}>
                画像を選択
              </Button>
            </Center>
            {componentImageSrc && (
              <Box flex="1" p={4}>
                <Image src={componentImageSrc} alt="Uploaded Image" maxH="300px" objectFit="contain" />
              </Box>
            )}
          </ModalBody>
          <ModalHeader>文章を入力してください</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="文章をここに入力"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              size="lg"
              resize="vertical"  // 必要に応じてリサイズを許可
              rows={10}  // 行数を指定
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmit}>
              送信
            </Button>
            <Button variant="ghost" onClick={onCloseModal1}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* モーダル2 */}
      <Modal isOpen={isOpenModal2} onClose={onCloseModal2}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>モード2</ModalHeader>
          <ModalHeader>文章を入力してください</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="文章をここに入力"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              size="lg"
              resize="vertical"  // 必要に応じてリサイズを許可
              rows={10}  // 行数を指定
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmit}>
              送信
            </Button>
            <Button variant="ghost" onClick={onCloseModal2}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
}
