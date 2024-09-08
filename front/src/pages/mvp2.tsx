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
  Textarea,
  Center,
  Image,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// const imagePaths = [
//   'data/1.jpeg',
//   'data/11.jpeg',
//   'data/13.jpeg',
//   'data/15.jpeg',
//   'data/17.jpeg',
//   'data/19.jpeg',
//   'data/20.jpeg',
//   'data/22.jpeg',
//   'data/3.jpeg',
//   'data/5.jpeg',
//   'data/7.jpeg',
//   'data/9.jpeg',
//   'data/12.jpeg',
//   'data/14.jpeg',
//   'data/16.jpeg',
//   'data/18.jpeg',
//   'data/2.jpeg',
//   'data/21.jpeg',
//   'data/23.jpeg',
//   'data/4.jpeg',
//   'data/6.jpeg',
//   'data/8.jpeg',
// ];
const imagePaths = [
    'data/1.jpeg',
    'data/2.jpeg',
    'data/3.jpeg',
    'data/4.jpeg',
    'data/5.jpeg',
    'data/6.jpeg',
    'data/7.jpeg',
    'data/8.jpeg',
    'data/9.jpeg',
    'data/10.jpeg',
    'data/11.jpeg',
    'data/12.jpeg',
    'data/13.jpeg',
    'data/14.jpeg',
    'data/15.jpeg',
    'data/16.jpeg',
    'data/17.jpeg',
    'data/18.jpeg',
    'data/19.jpeg',
    'data/20.jpeg',
  ];
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sortedImagePaths, setSortedImagePaths] = useState<string[]>(imagePaths); // ソートされた画像パスを保持
  const [feedBackText, setFeedBackText] = useState("");
  const [mode1, setMode1] = useState(false);
  const [mode2, setMode2] = useState(false);
  const [selectedText, setSelectedText] = useState(""); // 選択されたテキストを保持
  const [isHurigana1, setIsHurigana1] = useState(false);
  const [isHurigana2, setIsHurigana2] = useState(false);
  const [isHurigana3, setIsHurigana3] = useState(false);
  const [huriganaText1, setHuriganaText1] = useState("");
  const [huriganaText2, setHuriganaText2] = useState("");
  const [huriganaText3, setHuriganaText3] = useState("");
  const [isTextModalOpen, setIsTextModalOpen] = useState(false); // テキスト表示用モーダルの制御

  const [detailText, setDetailText] = useState("");

  const navigate = useNavigate();


  const getFeedbackWithImage = async () => {
    try {
      if (imageExtension && imageSrc) {
        
        const formData = new FormData();
        const file = new Blob([imageSrc], { type: `image/${imageExtension}` });
        const fileName = "sample.png";
        formData.append('image', file, fileName);
        formData.append('mediatype', imageExtension);
        formData.append('llm_description', imageExtension);
        formData.append('user_description', imageExtension);
        const requestOptions = {
          method: "POST",
          body: formData,
        };
        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'compare/', requestOptions);

        console.log("response: ", response);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setFeedBackText((prev) => prev + chunk);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleModalSubmit = async () => {
    try {
      if (componentImageSrc && inputText && imageExtension) {
        const formData = new FormData();
        const file = new Blob([componentImageSrc], { type: "image/png" });
        const fileName = "sample.png";
        formData.append('image', file, fileName);
        formData.append('text', inputText);
        formData.append('mediatype', imageExtension);
        const requestOptions = {
          method: "POST",
          body: formData,
        };
        console.log("API呼び出し");
        const response = await fetch(import.meta.env.VITE_FASTAPI_URL + 'descript/', requestOptions);
        console.log(response);
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        setMode1(true);
        setImageSrc(componentImageSrc);
        onCloseModal1();
        while (true) {
          const { done, value } = await reader?.read()!;
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setConvertedText((prev) => prev + chunk);
        }
        
        
      }
    } catch (error) {
      console.error("There was an error!", error);
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


  const handleModalSubmitRAG = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_FASTAPI_URL + 'ai_search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: inputTextForRAG })
      });
      setMode2(true);
      const data = await response.json();
      console.log(data);
      const sortedPaths = await data.id.map((id: number) => imagePaths[id - 1]); // idに基づいてimagePathsを並び替え
      console.log(sortedPaths);
      setSortedImagePaths(sortedPaths);
      if (selectedIndex !== null) {
        console.log("oldIndex:", selectedIndex);
        const newIndex = data.id.indexOf(`${selectedIndex+1}`);
        setSelectedIndex(newIndex);
        console.log("newIndex:", selectedIndex);
      }
      onCloseModal2();
      
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
  // 画像がクリックされたときに選択状態を更新する関数
  const handleImageClick = (index: number) => {
    if (selectedIndex === index) {
      setSelectedIndex(null); // もう一度クリックしたら選択を解除
    } else {
      setSelectedIndex(index); // 選択された画像を更新
    }
    console.log(selectedIndex);
  };


  const handleMode1 = () => {
    setMode1(false);
    setMode2(false);
    onOpenModal1();
  }

  const handleMode2 = () => {
    setMode1(false);
    setMode2(false);
    onOpenModal2();  
  }

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
      else if (huriganaIdx === 2) {
        setIsHurigana2(true);
      } else {
        setIsHurigana3(true);
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
        else if (huriganaIdx === 2) {
          setHuriganaText2((prev) => prev + chunk);
        } else {
          setHuriganaText3((prev) => prev + chunk);
        }
      }

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleHurigana1 = () => {
    if (huriganaText1 === "") {
      postHurigana(inputText, 1);
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

  const toggleHurigana3 = () => {
    if (huriganaText3 === "") {
      postHurigana(convertedText, 3);
    } else {
      setIsHurigana3(!isHurigana3);
    }
  };
  

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

  const gotoOutput = () => {
    navigate('/');  // "/about" へ画面遷移
  };

  return (
    <HStack spacing={0} align="stretch" minHeight={"100vh"}>
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
        <Text fontSize="xl">説明してみよう</Text>
        <Button bg="green" width="100%" colorScheme="blue" size="lg" onClick={handleMode1}>
          これな〜んだ？
        </Button>
        <Button bg="green" width="100%" colorScheme="blue" size="lg" onClick={handleMode2}>
          これど〜れだ？
        </Button>
        <Button width="100%" size="lg" bg="orange" colorScheme="teal" onClick={gotoOutput}>
          読むモード
        </Button>
      </VStack>
      {/* 右側のコンテンツ1 */}
      {mode1 && (
        <VStack flex="1" p={4} bg="gray.200" align="start" spacing={4}>
            
            <Button color="white" bg="green" onClick={getFeedbackWithImage}>フィードバックをもらう</Button>
              <HStack justifyContent="center" width="100%">
                <Box flex="1" p={4} display="flex" justifyContent="center">
                  {imageSrc && (
                    <Image
                      src={URL.createObjectURL(imageSrc)}
                      alt="Uploaded Image"
                      maxH="300px"
                      objectFit="contain"
                    />
                  )}
                </Box>
              </HStack>
              {feedBackText !== "" && (
                <VStack>
                  <Box 
                    flex="1" 
                    p={4} 
                    onMouseUp={handleTextSelection} 
                    cursor="text" 
                    border="1px solid black" 
                    borderRadius="md" 
                    bg="gray.100" 
                    ml={4}
                    overflow="hidden"          // ボックスの範囲を超える部分を隠す
                    textOverflow="ellipsis"    // テキストが長すぎる場合に "..." を表示
                    whiteSpace="normal"        // テキストが折り返されるように設定
                  >
                    {!isHurigana3 ? (
                      <Box p={4}>
                        <ReactMarkdown>{feedBackText || ""}</ReactMarkdown>
                      </Box>
                    ) : (
                      <Text fontSize="xl">{huriganaText3 || ""}</Text>
                    )}
                    
                  </Box>
                  <Button bg="green" width="50%" colorScheme="blue" size="lg" onClick={toggleHurigana3}>
                    ふりがな切り替え
                  </Button>
                </VStack>
              )}
            <HStack>
              {/* <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
                <Text fontSize="xl">
                  {inputText || ""}
                </Text>
              </Box> */}
              {inputText !== "" && (
                <VStack width="50%">
                  <Box 
                    flex="1" 
                    p={4} 
                    onMouseUp={handleTextSelection} 
                    cursor="text" 
                    border="1px solid black" 
                    borderRadius="md" 
                    bg="gray.100" 
                    ml={4} 
                  >
                    {!isHurigana1 ? (
                      <Text fontSize="xl">{inputText || ""}</Text>
                    ) : (
                      <Text fontSize="xl">{huriganaText1 || ""}</Text>
                    )}
                    
                  </Box>
                  <Button bg="green" width="50%" colorScheme="blue" size="lg" onClick={toggleHurigana1}>
                    ふりがな切り替え
                  </Button>
                </VStack>
              )}



              {/* <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
              <Text>{convertedText}</Text> */}

              {convertedText && (
                <VStack width="50%">
                  <Box 
                    flex="1" 
                    p={4} 
                    onMouseUp={handleTextSelection} 
                    cursor="text" 
                    border="1px solid black" 
                    borderRadius="md" 
                    bg="gray.100" 
                    ml={4} 
                    
                  >
                    <Text fontSize="xl">
                      {!isHurigana2 ? (
                        <Text fontSize="xl">{convertedText || ""}</Text>
                      ) : (
                        <Text fontSize="xl">{huriganaText2 || ""}</Text>
                      )}
                    </Text>
                  </Box>
                  <Button bg="green" width="50%" colorScheme="blue" size="lg" onClick={toggleHurigana2}>
                    ふりがな切り替え
                  </Button>
                </VStack>
              )}              
            {/* </Box> */}
            </HStack>
        </VStack>
      )}
      {/* 右側のコンテンツ2 */}
      {mode2 && (
        <Box display="flex" flexWrap="wrap">
          {/* <Box flex="1" p={4} cursor="text" border="1px solid black" borderRadius="md" bg="gray.100" ml={4}>
          <Text>あなたの入力した文章とマッチする画像を、類似度が高い順に並べた結果以下の通りになりました。あなたの選んだ画像がより順番の先頭となるように上手く説明してみましょう！！！！</Text>  
          </Box> */}
            {sortedImagePaths.map((path, index) => (
              <VStack>
                <Box
                key={index}
                marginTop={10}
                marginLeft={20}
                marginRight={20}
                // width="120px" // Boxの幅を指定
                // height="120px" // Boxの高さを指定
                border={selectedIndex === index ? '8px solid red' : 'none'} // 選択された画像に赤い輪郭を表示
                borderRadius="md"
                display="flex" // 子要素を中央に配置するため
                justifyContent="center" // 水平方向に中央揃え
                alignItems="center" // 垂直方向に中央揃え
              >
                <Image
                  src={path}
                  alt={`image-${index}`}
                  boxSize="100px" // 画像のサイズを指定
                  objectFit="cover" // 画像の比率を保ちながら中央に収める
                  borderRadius="md"
                />
              </Box>
              <Text>
                {index}
              </Text>
            </VStack>
            ))}
        </Box>
      )}
      {/* モーダル1 */}
      <Modal isOpen={isOpenModal1} onClose={onCloseModal1}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>画像を選んでください</ModalHeader>
          <ModalBody>
            <Center>
              <Button bg="green" width="90%" colorScheme="blue" onClick={handleUploadClick}>
                画像を選ぶ
              </Button>
            </Center>
            {componentImageSrc && (
              <Box flex="1" p={4}>
                <Image src={URL.createObjectURL(componentImageSrc)} alt="Uploaded Image" maxH="300px" objectFit="contain" />
              </Box>
            )}
          </ModalBody>
          <ModalHeader>この画像を説明してみよう</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="文章をここに打つ"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              size="lg"
              resize="vertical"  // 必要に応じてリサイズを許可
              rows={10}  // 行数を指定
            />
          </ModalBody>
          <ModalFooter>
            <Button bg="green" colorScheme="blue" mr={3} onClick={handleModalSubmit}>
              送信
            </Button>
            <Button bg="green" variant="ghost" onClick={onCloseModal1}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* モーダル2 */}
      <Modal isOpen={isOpenModal2} onClose={onCloseModal2}>
        <ModalOverlay />
        <ModalContent maxWidth={"50vw"}>
          <ModalHeader>画像を選んでください</ModalHeader>
          <ModalBody>
            <Box display="flex" flexWrap="wrap">
              {imagePaths.map((path, index) => (
                <Box
                  key={index}
                  m={2}
                  onClick={() => handleImageClick(index)}
                  border={selectedIndex === index ? '8px solid red' : 'none'} // 選択された画像に赤い輪郭を表示
                  borderRadius="md"
                  cursor="pointer" // クリック可能であることを示すためにカーソルを変更
                >
                  <Image
                    src={path}
                    alt={`image-${index}`}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  {index+1}
                </Box>
              ))}
            </Box>
          </ModalBody>
          <ModalHeader>この画像を説明してみよう</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="文章をここに打つ"
              value={inputTextForRAG}
              onChange={(e) => setInputTextForRAG(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button bg="green" colorScheme="blue" mr={3} onClick={handleModalSubmitRAG}>
              送信
            </Button>
            <Button bg="green" variant="ghost" onClick={onCloseModal2}>キャンセル</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
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
            <Button bg="green" colorScheme="blue" mr={3} onClick={() => handleGetDetail()}>
              単語の意味を調べる
            </Button>
            <Button bg="green" colorScheme="blue" mr={3} onClick={() => handleCloseModal(false)}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </HStack>
    
  );
}