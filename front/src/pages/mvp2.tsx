import { Button, VStack, HStack, Box, Image as ChakraImage, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Center } from '@chakra-ui/react';
import { useState, useRef } from 'react';



export default function Mvp2() {
  const { isOpen: isOpenModal1, onOpen: onOpenModal1, onClose: onCloseModal1 } = useDisclosure(); // モーダルの制御
  const { isOpen: isOpenModal2, onOpen: onOpenModal2, onClose: onCloseModal2 } = useDisclosure(); // モーダルの制御
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const [inputTextForRAG, setInputTextForRAG] = useState(""); // モーダル内で入力されたテキスト
  const [imageSrc, setImageSrc] = useState<File | undefined>(undefined);
  const [componentImageSrc, setComponentImageSrc] = useState<File | undefined>(undefined);
  const [imageExtension, setImageExtension] = useState<string | null>(null); // 画像の拡張子を格納
  const inputFileRef = useRef<HTMLInputElement | null>(null); // ファイル選択の参照
  const [convertedText, setConvertedText] = useState(""); // 変換後のテキストを格納

  const handleModalSubmit = async () => {
    try {
      if (componentImageSrc && inputText && imageExtension) {
        const formData = new FormData();
        const file = new Blob([componentImageSrc], { type: "image/png" });
        const fileName = "sample.png";
        
        formData.append('image', file, fileName);
        formData.append('text', "aiueo");
        formData.append('mediatype', "png");
    
        const requestOptions = {
          method: "POST",
          body: formData,
        };
        
        console.log("API呼び出し");
        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'descript/', requestOptions);
        console.log(response);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setConvertedText((prev) => prev + chunk);
        }
  
        setImageSrc(componentImageSrc);
        onCloseModal1();
      }
    } catch (error) {
      console.error("There was an error!", error);
    }
  };


  const handleModalSubmitRAG = async () => {
    try {

      const response = await fetch(
        import.meta.env.VITE_FASTAPI_URL + 'ai_search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: inputTextForRAG })
      });
      const data = await response.json();
      
      console.log(data);
      
    } catch (error) {
      console.error("There was an error!", error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageExtension(file.name.split('.').pop() ?? 'unknown');
      const reader = new FileReader();
      setComponentImageSrc(file);
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
          好きな画像に対して説明
        </Button>
        <Button width="100%" colorScheme="blue" size="lg" onClick={onOpenModal2}>
          10枚の中から画像を説明
        </Button>
      </VStack>
      <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
        {imageSrc && (
          <Box flex="1" p={4}>
            <ChakraImage src={imageSrc} alt="Uploaded Image" maxH="300px" objectFit="contain" />
          </Box>
        )}
        <Box flex="1" p={4}>
          <pre>{convertedText}</pre>
        </Box>
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
                <ChakraImage src={componentImageSrc} alt="Uploaded Image" maxH="300px" objectFit="contain" />
              </Box>
            )}
          </ModalBody>
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
          <ModalHeader>画像を選択してください</ModalHeader>
          <ModalHeader>文章を入力してください</ModalHeader>
          <ModalBody>
            <Input
              placeholder="文章をここに入力"
              value={inputTextForRAG}
              onChange={(e) => setInputTextForRAG(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleModalSubmitRAG}>
              送信
            </Button>
            <Button variant="ghost" onClick={onCloseModal2}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
  );
}
