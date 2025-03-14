import { useEvent } from "expo";
import { useVideoPlayer, VideoSource, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { View, FlatList, Dimensions, StyleSheet, SafeAreaView, Text, ViewToken, Pressable } from "react-native";

const videos = [
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

const { width, height } = Dimensions.get("window");

function Reel({ videoLink, shouldPlay }: { videoLink: VideoSource; shouldPlay: boolean }) {
  const player = useVideoPlayer(videoLink, (player) => {
    player.loop = true;
  });

  const { isPlaying } = useEvent(player, 'playingChange', {
    isPlaying: player.playing,
  });

  useEffect(() => {
    console.log("Reel Mounted:", videoLink);

    return () => {
      console.log("Reel Unmounted:", videoLink);
    };
  }, []);

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
      player.currentTime = 0;
    }
  }, [shouldPlay]);

  const handleClick = () => {
    if(isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <Pressable style={styles.reelContainer}>
      <VideoView player={player} style={styles.reel} contentFit="cover" nativeControls={false} />
      <Pressable style={styles.overlayTouchable} onPress={handleClick}></Pressable>
    </Pressable>
  );
}

const FullScreenList = () => {
  const [currentViewableItemIndex, setCurrentViewableItemIndex] = useState(0);
  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: any }) => {
    if (viewableItems.length > 0) {
      setCurrentViewableItemIndex(viewableItems[0].index ?? 0);
    }
  };

  const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => <Reel shouldPlay={index === currentViewableItemIndex} videoLink={item} />}
        pagingEnabled
        horizontal={false} // Vertical scrolling
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        decelerationRate="fast"
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        windowSize={2}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red",
  },
  reelContainer: {
    width: width,
    height: height, // Each item takes full screen
  },
  reel: {
    width: "100%",
    height: "100%",
  },
  overlayTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default FullScreenList;
