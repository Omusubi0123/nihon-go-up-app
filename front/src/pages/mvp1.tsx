import {
  Button,
  VStack,
  HStack,
  Box,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Image
} from '@chakra-ui/react';
import { useState } from 'react';

export default function mvp1() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // モーダルの制御
  const [text, setText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const [imageSrc, setImageSrc] = useState(""); // 選択された画像のURL
  const [imageExtension, setImageExtension] = useState(""); // 選択された画像の拡張子
  const [selectedText, setSelectedText] = useState(""); // 選択されたテキスト
  const [isTextModalOpen, setIsTextModalOpen] = useState(false); // テキスト表示用モーダルの制御
  const [detailText, setDetailText] = useState(""); // 単語の意味を格納

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

  const handleClick = async () => {
    try {
      if (inputText) {
        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'convert/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw_text: inputText, mode: "easy" })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setConvertedText((prev) => prev + chunk);
        }
      } else if (imageSrc) {
        convertImageToBase64(imageSrc, async (base64String) => {
          const formData = new FormData();
          formData.append('image', base64String);
          formData.append('text', inputText);

          const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'ocr/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: imageSrc, type: "easy", extension: imageExtension })
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const reader = response.body?.getReader();
          const decoder = new TextDecoder("utf-8");
          while (true) {
            const { done, value } = await reader?.read()!;
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setDetailText((prev) => prev + chunk);
          }
        });
      } else {
        console.error('No input text.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGetDetail = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'detail/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: selectedText })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setConvertedText((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleModalSubmit = () => {
    setText(inputText);  // 入力されたテキストを反映
    setImageSrc("");  // 画像を削除
    setImageExtension("");  // 画像の拡張子を削除
    onClose();  // モーダルを閉じる
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageExtension(file.name.split('.').pop());
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
      setText("");
    }
  };

  // テキストの選択処理
  const handleTextSelection = () => {
    const selectedText = window.getSelection()?.toString() || "";
    if (selectedText) {
      setSelectedText(selectedText);
      setIsTextModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setDetailText("");
    setIsTextModalOpen(false);
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
        <Button width="100%" colorScheme="blue" size="lg" onClick={onOpen}>
          文章を入力する
        </Button>
        <Input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="uploadImage"
          onChange={handleImageUpload}
        />
        <Button width="100%" colorScheme="blue" size="lg" onClick={() => document.getElementById('uploadImage')?.click()}>
          画像をアップロード
        </Button>
        <Button width="100%" colorScheme="blue" size="lg" onClick={handleClick}>
          文章変換
        </Button>
      </VStack>
        {inputText !== "" && (
          <Box flex="1" p={4} onMouseUp={handleTextSelection} cursor="text">
            <Text fontSize="xl">{text || ""}</Text>
          </Box>          
        )}
        {imageSrc && (
          <Box flex="1" p={4}>
            <Image src={imageSrc} alt="Uploaded" height="400px" objectFit="cover" />
          </Box>
        )}
        {convertedText && (
          <Box flex="1" p={4} onMouseUp={handleTextSelection} cursor="text">
            <Text fontSize="xl">{convertedText || ""}</Text>
          </Box>
        )}
      {/* テキスト選択用モーダル */}
      <Modal isOpen={isTextModalOpen} onClose={() => handleCloseModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>選択されたテキスト</ModalHeader>
          <ModalBody>
            <Text>{selectedText}</Text>
          </ModalBody>
          {detailText && (
            <ModalBody>
              <Text>{detailText}</Text>
            </ModalBody>
          )  
          }
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => handleGetDetail()}>
              単語の意味を調べる
            </Button>
            <Button colorScheme="blue" mr={3} onClick={() => handleCloseModal(false)}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* モーダル */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>文章を入力してください</ModalHeader>
          <ModalBody>
            <Input
              placeholder="文章をここに入力"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmit}>
              決定
            </Button>
            <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
};
