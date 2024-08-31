import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  useColorScheme,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import cheerio from 'cheerio-without-node-native';

interface FoodGroup {
  title: string;
  foods: string[];
}

const FoodPickerApp: React.FC = () => {
  const [groups, setGroups] = useState<FoodGroup[]>([]);
  const [groupTitle, setGroupTitle] = useState<string>('');
  const [foodInput, setFoodInput] = useState<string>('');
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(
    null,
  );
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<number | null>(null);

  useEffect(() => {
    // Load saved data when the component mounts
    const loadData = async () => {
      try {
        const storedGroups = await AsyncStorage.getItem('groups');
        if (!storedGroups || storedGroups === '[]') {
          setGroups([
            {title: '日常吃飯', foods: ['便當', '麵食', '水餃']},
            {
              title: '貴一點，但很好吃',
              foods: ['火鍋', '咖哩', '拉麵', '生魚片', '丼飯'],
            },
            {title: '不管了我是豬', foods: ['火鍋', '燒烤', 'Buffet']},
          ]); // 如果沒有資料，才設定預設空值
        } else {
          setGroups(JSON.parse(storedGroups));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    // Save data whenever groups state changes
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('groups', JSON.stringify(groups));
      } catch (error) {
        console.error('Failed to save data:', error);
      }
    };

    saveData();
  }, [groups]);

  const toggleGroupExpand = (index: number) => {
    if (expandedGroups.includes(index)) {
      setExpandedGroups(expandedGroups.filter(i => i !== index));
    } else {
      setExpandedGroups([...expandedGroups, index]);
    }
  };

  const addGroup = () => {
    if (groupTitle) {
      setGroups([...groups, {title: groupTitle, foods: []}]);
      setGroupTitle('');
    }
  };

  const addFoodToGroup = (groupIndex: number) => {
    if (foodInput) {
      const updatedGroups = [...groups];
      updatedGroups[groupIndex].foods.push(foodInput);
      setGroups(updatedGroups);
      setFoodInput('');
    }
  };

  const handleFoodInputSubmit = (groupIndex: number) => {
    addFoodToGroup(groupIndex);
  };

  const updateGroupTitle = (index: number, newTitle: string) => {
    const updatedGroups = [...groups];
    updatedGroups[index].title = newTitle;
    setGroups(updatedGroups);
  };

  const updateFoodItem = (
    groupIndex: number,
    foodIndex: number,
    newFood: string,
  ) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].foods[foodIndex] = newFood;
    setGroups(updatedGroups);
  };

  const confirmDeleteGroup = (groupIndex: number, titile: string) => {
    Alert.alert(
      '刪除警告',
      `確認要刪除［${titile}］清單嗎?`,
      [
        {
          text: '確定',
          style: 'destructive',
          onPress: () => deleteGroup(groupIndex),
        },
        {text: '取消', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const deleteGroup = (groupIndex: number) => {
    const updatedGroups = [...groups];
    updatedGroups.splice(groupIndex, 1);
    setGroups(updatedGroups);
    setSelectedGroupIndex(null);
  };

  const confirmDeleteFood = (
    groupIndex: number,
    foodIndex: number,
    foodItem: string,
  ) => {
    Alert.alert(
      '刪除警告',
      `確認要刪除［${foodItem}］食物嗎?`,
      [
        {
          text: '確定',
          style: 'destructive',
          onPress: () => deleteFoodFromGroup(groupIndex, foodIndex),
        },
        {text: '取消', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const deleteFoodFromGroup = (groupIndex: number, foodIndex: number) => {
    const updatedGroups = [...groups];
    updatedGroups[groupIndex].foods.splice(foodIndex, 1);
    setGroups(updatedGroups);
  };

  const randomPickFromGroup = () => {
    if (
      selectedGroupIndex !== null &&
      groups[selectedGroupIndex].foods.length > 0
    ) {
      const randomIndex = Math.floor(
        Math.random() * groups[selectedGroupIndex].foods.length,
      );
      setSelectedFood(groups[selectedGroupIndex].foods[randomIndex]);
    } else {
      setSelectedFood('');
    }
  };

  const handleDoubleTap = (index: number) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      // 這裡可以處理雙擊事件
      toggleGroupExpand(index);
      return;
    }
    setSelectedGroupIndex(index);
    setLastTap(now);
  };

  const openFoodSearchInGoogleMaps = async (foodName: string) => {
    // 建立搜尋食物的 Google Maps URL
    const url = `https://www.google.com/maps/search/?api=1&query=${foodName}`;
    // 檢查設備上是否安裝了 Google Maps 應用
    const isGoogleMapsAvailable = await Linking.canOpenURL(url);
    if (isGoogleMapsAvailable) {
      // 如果 Google Maps 可用，則打開應用程式
      Linking.openURL(url).catch(err =>
        console.error('Failed to open Google Maps', err),
      );
    } else {
      // 如果 Google Maps 不可用，則在瀏覽器中打開該網址
      Linking.openURL(url).catch(err =>
        console.error('Failed to open browser', err),
      );
    }
  };

  const colorScheme = useColorScheme();

  // const [images, setImages] = useState<string[]>([]);
  // const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 定義搜尋關鍵字
  // const searchQuery = '大便';
  // const URL = `https://www.google.com.tw/search?hl=zh-TW&tbm=isch&q=${encodeURIComponent(
  //   searchQuery,
  // )}`;

  // const loadGraphicCards = async () => {
  //   const searchUrl = 'https://www.amazon.de/s/?page=1&keywords=graphic+card';
  //   const response = await fetch(searchUrl); // fetch page

  //   const htmlString = await response.text(); // get response text
  //   const $ = cheerio.load(
  //     `<ul>
  //       <li>Item 1</li>
  //       <li>Item 2</li>
  //     </ul>`,
  //   );
  //   const listItems = $('ul').find('li');
  //   console.log(listItems.length);
  // };

  // 處理圖片選擇
  // const handleSelectImage = (url: string) => {
  //   setSelectedImage(url);
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>美食選擇器</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.input, styles.textDark]}
          placeholder="新增清單"
          placeholderTextColor={
            colorScheme === 'dark'
              ? styles.placeholderTextDark.color
              : styles.placeholderTextDark.color
          } // 動態設置 placeholder 顏色
          value={groupTitle}
          onChangeText={setGroupTitle}
          onSubmitEditing={addGroup}
        />
      </View>

      <FlatList
        data={groups}
        renderItem={({item, index}) => (
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={[
                styles.card,
                selectedGroupIndex === index && styles.selectedCard,
              ]}
              onPress={() => {
                handleDoubleTap(index);
              }}>
              <View style={styles.cardHeader}>
                <TextInput
                  style={styles.groupTitle}
                  value={item.title}
                  onChangeText={text => updateGroupTitle(index, text)}
                />
                <View style={styles.cardButtons}>
                  <Text
                    style={
                      colorScheme === 'dark'
                        ? styles.textDark
                        : styles.textLight
                    }>
                    數量：{item.foods.length}
                  </Text>
                  <TouchableOpacity onPress={() => toggleGroupExpand(index)}>
                    <Text style={styles.collapseButton}>
                      {expandedGroups.includes(index) ? '−' : '+'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDeleteGroup(index, item.title)}>
                    <Text style={styles.deleteButton}>X</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {expandedGroups.includes(index) && (
                <View style={styles.foodList}>
                  <FlatList
                    data={item.foods}
                    renderItem={({item: foodItem, index: foodIndex}) => (
                      <View style={styles.foodItem}>
                        <TextInput
                          style={[
                            styles.foodText,
                            colorScheme === 'dark'
                              ? styles.textDark
                              : styles.textLight,
                          ]}
                          value={foodItem}
                          onChangeText={text =>
                            updateFoodItem(index, foodIndex, text)
                          }
                          onSubmitEditing={() => handleFoodInputSubmit(index)}
                        />
                        <TouchableOpacity
                          onPress={() => openFoodSearchInGoogleMaps(foodItem)}>
                          <Image
                            source={require('./assets/google-maps-icon.png')} // 或者使用URL
                            style={styles.icon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            confirmDeleteFood(index, foodIndex, foodItem)
                          }>
                          <Text style={styles.deleteFoodButton}>X</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    keyExtractor={(_item, idx) => idx.toString()}
                  />
                  <TextInput
                    style={[styles.foodInput, styles.textDark]}
                    placeholder="新增食物"
                    placeholderTextColor={
                      colorScheme === 'dark'
                        ? styles.placeholderTextDark.color
                        : styles.placeholderTextDark.color
                    } // 動態設置 placeholder 顏色
                    value={foodInput}
                    onChangeText={setFoodInput}
                    onSubmitEditing={() => {
                      handleFoodInputSubmit(index);
                      // loadGraphicCards();
                    }}
                  />
                  {/* {selectedImage && (
                    <Image
                      source={{uri: selectedImage}}
                      style={styles.selectedImage}
                    />
                  )} */}
                </View>
              )}
            </TouchableOpacity>
            {/* {images.length > 0 && (
              <FlatList
                data={images}
                horizontal
                renderItem={({item}) => (
                  <TouchableOpacity onPress={() => handleSelectImage(item)}>
                    <Image source={{uri: item}} style={styles.imageOption} />
                  </TouchableOpacity>
                )}
                keyExtractor={item => item}
                style={styles.imageList}
              />
            )} */}
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <TouchableOpacity
        style={styles.randomPickButton}
        onPress={randomPickFromGroup}>
        <Text style={styles.randomPickButtonText}>神啊！幫幫我( ˘•ω•˘ )</Text>
      </TouchableOpacity>

      {selectedFood && (
        <TouchableOpacity
          onPress={() => openFoodSearchInGoogleMaps(selectedFood)}>
          <View style={styles.viewResult}>
            <Text style={styles.selectedText}>
              吃這個(ゝ∀･)b {selectedFood}
            </Text>
            <Image
              source={require('./assets/google-maps-icon.png')} // 或者使用URL
              style={styles.icon}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343A40',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#000000',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#0056b3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
  },
  cardButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapseButton: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#007BFF',
    marginRight: 10,
    marginLeft: 10,
  },
  deleteButton: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  foodList: {
    marginTop: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  foodText: {
    flex: 1,
  },
  deleteFoodButton: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  foodInput: {
    height: 40,
    borderColor: '#CED4DA',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  randomPickButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 15,
  },
  randomPickButtonText: {
    color: '#343A40',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  selectedText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28A745',
    textAlign: 'center',
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#000',
  },
  placeholderTextLight: {
    color: '#aaa',
  },
  placeholderTextDark: {
    color: '#aaa',
  },
  icon: {
    width: 32,
    height: 32,
  },
  selectedImage: {
    width: 50,
    height: 50,
    marginLeft: 10,
    borderRadius: 4,
  },
  imageList: {
    marginTop: 10,
  },
  imageOption: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 4,
  },
  viewResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center', // 文字靠左，圖片靠右
  },
});

export default FoodPickerApp;
