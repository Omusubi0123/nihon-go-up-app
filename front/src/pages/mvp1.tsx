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
  Image,
  Textarea,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function mvp1() {
  const { isOpen, onOpen, onClose } = useDisclosure(); // モーダルの制御
  const [text, setText] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [detailText, setDetailText] = useState("");
  const [inputText, setInputText] = useState(""); // モーダル内で入力されたテキスト
  const [imageSrc, setImageSrc] = useState<File | undefined>(undefined);
  const [imageExtension, setImageExtension] = useState(""); // 選択された画像の拡張子
  const [selectedText, setSelectedText] = useState(""); // 選択されたテキスト
  const [isTextModalOpen, setIsTextModalOpen] = useState(false); // テキスト表示用モーダルの制御
  const [componentImageSrc, setComponentImageSrc] = useState<File | undefined>(undefined);
  const inputFileRef = useRef<HTMLInputElement | null>(null); // ファイル選択の参照
  const [isHurigana1, setIsHurigana1] = useState(false);
  const [isHurigana2, setIsHurigana2] = useState(false);
  const [huriganaText1, setHuriganaText1] = useState("");
  const [huriganaText2, setHuriganaText2] = useState(""); 

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
      } else if (imageExtension && componentImageSrc) {
        const formData = new FormData();
        // const file = new Blob([componentImageSrc], { type: `image/${imageExtension}` });
        const file = new Blob([componentImageSrc], { type: `image/${imageExtension}` });
        const fileName = "sample.png";
        formData.append('image', file, fileName);
        formData.append('mediatype', imageExtension);
        const requestOptions = {
          method: "POST",
          body: formData,
        };

        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'ocr/', requestOptions);
        console.log("response: ", response);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setConvertedText((prev) => prev + chunk);
        }
      } else {
        console.error('No input text.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };




  const handleGetDetail = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'meaning/', {
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
        setDetailText((prev) => prev + chunk);
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

  const handleUploadClick = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageExtension(file.name.split('.').pop() ?? 'unknown');
      const reader = new FileReader();
      setComponentImageSrc(file);
      setImageSrc(file);
      reader.readAsDataURL(file);
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


  const postHurigana = async (targetText: string, huriganaIdx: number) => {
    try {
      const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'hurigana/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: targetText})
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (huriganaIdx === 1) {
        setIsHurigana1(true);
      }
      else {
        setIsHurigana2(true);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (huriganaIdx === 1) {
          setHuriganaText1((prev) => prev + chunk);
        }
        else {
          setHuriganaText2((prev) => prev + chunk);
        } 
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleHurigana1 = () => {
    if (huriganaText1 === "") {
      postHurigana(text, 1);
    } else {
      setIsHurigana1(!isHurigana1);
    }
  };

  const toggleHurigana2 = () => {
    if (huriganaText2 === "") {
      postHurigana(convertedText, 2);
    } else {
      setIsHurigana2(!isHurigana2);
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
          文章を入力する
        </Button>
        <Input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="uploadImage"
          onChange={handleFileChange}
        />
        <Button width="100%" colorScheme="blue" size="lg" onClick={handleUploadClick}>
          画像をアップロード
        </Button>
        <Button width="100%" colorScheme="blue" size="lg" onClick={handleClick}>
          文章変換
        </Button>
      </VStack>
      {/* 右側の要素 */}
      <Box p={10} display="flex" flexDirection="row" justifyContent="space-between">
        {imageSrc && (
          <Box flex="1" p={4}>
            <Image src={URL.createObjectURL(imageSrc)} alt="Uploaded" height="400px" objectFit="cover" />
          </Box>
        )}
          {inputText !== "" && (
            <VStack>
              <Box flex="1" p={4} onMouseUp={handleTextSelection} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" mr={4}>
                {!isHurigana1 ? (
                  <Text fontSize="xl">{text || ""}</Text>
                ) : (
                  <Text fontSize="xl">{huriganaText1 || ""}</Text>
                )}
                
              </Box>
              <Button marginRight={10} width="100%" colorScheme="blue" size="lg" onClick={toggleHurigana1}>
                ふりがな切り替え
              </Button>
            </VStack>
          )}
        
          {convertedText && (
            <VStack>
              <Box flex="1" p={4} onMouseUp={handleTextSelection} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
                <Text fontSize="xl">
                  {!isHurigana2 ? (
                    <Text fontSize="xl">{convertedText || ""}</Text>
                  ) : (
                    <Text fontSize="xl">{huriganaText2 || ""}</Text>
                  )}
                </Text>
              </Box>
              <Button marginLeft={10} width="100%" colorScheme="blue" size="lg" onClick={toggleHurigana2}>
                ふりがな切り替え
              </Button>
            </VStack>
          )}
        
      </Box>
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
              <ReactMarkdown>{detailText}</ReactMarkdown>
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
      {/* モーダル2 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
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
              決定
            </Button>
            <Button variant="ghost" onClick={onClose}>キャンセル</Button>
          </ModalFooter>
          </ModalContent>
      </Modal>
    </HStack>
  );
};
