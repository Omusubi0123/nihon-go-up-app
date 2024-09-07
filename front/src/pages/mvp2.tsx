import { Button, VStack, HStack, Box, Text, Image, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Center } from '@chakra-ui/react';
import { useState, useRef } from 'react';

export default function mvp2() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // モーダルの制御
  // const [text, setText] = useState("");
  // const [convertedText, setConvertedText] = useState("");
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const [imageSrc, setImageSrc] = useState<string | null>(null); // 画像のURLを格納
  const inputFileRef = useRef<HTMLInputElement | null>(null); // ファイル選択の参照

  const handleModalSubmit = async () => {
    try {
      // const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'cotomi/', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ prompt: inputText })
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const reader = response.body?.getReader();
      // const decoder = new TextDecoder("utf-8");
      // while (true) {
      //   const { done, value } = await reader?.read()!;
      //   if (done) break;
      //   const chunk = decoder.decode(value, { stream: true });
      //   setConvertedText((prev) => prev + chunk);
      // }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ファイル選択後に画像をプレビューする関数
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // ファイルの取得
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result as string); // 読み込んだ画像のURLをセット
      };
      reader.readAsDataURL(file); // ファイルをデータURLとして読み込む
    }
  };

  // 画像アップロードボタンがクリックされた時にファイル選択をトリガー
  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click(); // inputのclickイベントをトリガー
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
        <Button width="100%" colorScheme="blue" size="lg" onClick={onOpen}>
          画像をアップロード
        </Button>
      </VStack>
      <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
        {imageSrc && (
          <Box flex="1" p={4}>
            <Image src={imageSrc} alt="Uploaded Image" maxH="300px" objectFit="contain" />
          </Box>
        )}
      </VStack>
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
          <Center>
            <Button width="90%" colorScheme="blue" onClick={handleUploadClick}>
              画像を選択
            </Button>
          </Center>
          {imageSrc && (
          <Box flex="1" p={4}>
            <Image src={imageSrc} alt="Uploaded Image" maxH="300px" objectFit="contain" />
          </Box>
          )}
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmit}>
              送信
            </Button>
            <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
}
