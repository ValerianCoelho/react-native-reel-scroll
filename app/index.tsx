import Slider from "@react-native-community/slider";
import { useEvent } from "expo";
import { useVideoPlayer, VideoSource, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Dimensions, StyleSheet, SafeAreaView, Text, View, Pressable } from "react-native";

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

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1); // Default to 1 to avoid division by zero

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
    }
  }, [shouldPlay]);

  useEffect(() => {
    const updateProgress = () => {
      setProgress(player.currentTime);
      
      // Only update duration if it's a valid number and not zero
      if (player.duration && player.duration > 0) {
        setDuration(player.duration);
      }
    };

    const interval = setInterval(updateProgress, 500); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  const handleSeek = (value: number) => {
    player.currentTime = value;
    setProgress(value);
  };

  return (
    <Pressable style={styles.reelContainer}>
      <VideoView player={player} style={styles.reel} contentFit="cover" nativeControls={false} />

      <Pressable style={styles.overlayTouchable} onPress={() => (isPlaying ? player.pause() : player.play())}></Pressable>

      {/* Slider for Seeking */}
      <View style={styles.sliderContainer}>
        <Slider
          style={{ width: "90%", height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={progress}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#5C00CF"
          maximumTrackTintColor="#888"
          thumbTintColor="#5C00CF"
        />
      </View>
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
        decelerationRate="fast"
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
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
    position: "relative",
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
  slider: {
    position: "absolute",
    bottom: 20,
    width: "90%",
    alignSelf: "center",
  },
   sliderContainer: {
    position: "absolute",
    bottom: 20, // Adjust as needed
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

export default FullScreenList;
