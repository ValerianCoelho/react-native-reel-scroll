import { View, Dimensions, FlatList, StyleSheet, Pressable } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';

const { height, width } = Dimensions.get('window');

const videos = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
];

export default function Index() {
  const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        renderItem={({ item, index }) => (
          <Item item={item} shouldPlay={index === currentViewableItemIndex} />
        )}
        keyExtractor={(item) => item}
        pagingEnabled
        // horizontal={false}
        // showsVerticalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        // initialNumToRender={2} // Render 3 items initially
        windowSize={3} // Keep 3 items in memory
        // maxToRenderPerBatch={2} // Render 3 at a time
        // removeClippedSubviews={true} // Unmount off-screen items
        // snapToInterval={height} // Snap to full-screen video
        snapToAlignment="start"
        decelerationRate="fast" // Faster scrolling like Instagram
      />
    </View>
  );
}

const Item = ({ item, shouldPlay }) => {
  const player = useVideoPlayer(item, (player) => {
    player.loop = true; // Enable looping
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0; // Reset to beginning
    }
  }, [shouldPlay]);

  return (
    <Pressable onPress={() => (isPlaying ? player.pause() : player.play())}>
      <View style={styles.videoContainer}>
        <VideoView style={styles.video} player={player} contentFit='cover' />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width,
    height,
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
