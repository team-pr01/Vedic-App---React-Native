import React from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get('window');

const Reels = () => {
  const data = [
    'https://www.youtube.com/shorts/ZXu5lUnST_8',
    'https://www.youtube.com/shorts/noT3rCOf3RQ',
    'https://www.youtube.com/shorts/hRzoqtGr2Zw',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item + index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <WebView
            source={{ uri: item }}
            style={{ width, height }}
            allowsFullscreenVideo
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      />
    </View>
  );
};

export default Reels;
