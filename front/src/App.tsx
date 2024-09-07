import { Button, VStack, HStack, Box, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from '@chakra-ui/react';
import { useState } from 'react';
const App = () => {
  const { isOpen, onOpen, onClose } = useDisclosure(); // モーダルの制御
  const [text, setText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const handleClick = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'cotomi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: inputText })
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
    onClose();  // モーダルを閉じる
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
        <Button width="100%" colorScheme="blue" size="lg">
          画像をアップロード
        </Button>
        <Button width="100%" colorScheme="blue" size="lg">
          PDFをアップロード
        </Button>
        <Button width="100%" colorScheme="blue" size="lg" onClick={handleClick}>
          文章変換
        </Button>
      </VStack>
      <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
        <Box flex="1" p={4}>
          <Text fontSize="xl">{text || ""}</Text>
        </Box>
        <Box flex="1" p={4}>
          <Text fontSize="xl">{convertedText || ""}</Text>
        </Box>
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
export default App;