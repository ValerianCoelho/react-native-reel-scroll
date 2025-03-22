import Slider from "@react-native-community/slider";
import { useEvent } from "expo";
import { useVideoPlayer, VideoPlayer, VideoSource, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Dimensions, StyleSheet, SafeAreaView, Text, View, Pressable } from "react-native";

const videos = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

const { width, height } = Dimensions.get("window");

function Reel({ videoLink, shouldPlay }: { videoLink: VideoSource; shouldPlay: boolean }) {
  const player = useVideoPlayer(videoLink, (player) => {
    player.loop = true; // Determines whether the player should automatically replay after reaching the end of the video.
    player.bufferOptions = {
      minBufferForPlayback: 1024 * 1024, // Android Only | Minimum duration of the buffer in seconds (default is 2) required to continue playing after the player has been paused or started buffering. This property will be ignored if preferredForwardBufferDuration is lower.
      maxBufferBytes: 1024 * 1024, // Android Only | The maximum number of bytes that the player can buffer from the network. When 0 (default) the player will automatically decide appropriate buffer size.
      preferredForwardBufferDuration: 1, // Android & iOS | The duration in seconds which determines how much media the player should buffer ahead of the current playback time. On iOS when set to 0 the player will automatically decide appropriate buffer duration. (Android: 20, iOS: 0)
      // prioritizeTimeOverSizeThreshold: false, // Android | A Boolean value which determines whether the player should prioritize time over size when buffering media. (default: false)
    }
    
  });
  useEffect(()=>{
    console.log(player.status)
  }, [player])
  // useEffect(()=>{
    // console.log(player.bufferedPosition)
    // console.log(player.duration) // Float value indicating the duration of the current video in seconds.
    // console.log(player.playing) // Boolean value whether the player is currently playing. Use play and pause methods to control the playback.
    // console.log(player.status)  // Indicates the current status of the player.
    //                             // idle: The player is not playing or loading any videos.
    //                             // loading: The player is loading video data from the provided source
    //                             // readyToPlay: The player has loaded enough data to start playing or to continue playback.
    //                             // error: The player has encountered an error while loading or playing the video.

    // player.currentTime = 0; // Float value indicating the current playback time in seconds. If the player is not yet playing, this value indicates the time position at which playback will begin once the play() method is called.
    // player.muted = false; // Boolean value whether the player is currently muted. Setting this property to true/false will mute/unmute the player.
    // player.replay() // Seeks the playback to the beginning.
  // }, [])

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
    
  });

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1); // Default to 1 to avoid division by zero

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
      
      <VideoView player={player} style={styles.reel} contentFit="cover" nativeControls={true} />

      <Pressable style={styles.overlayTouchable} onPress={() => (isPlaying ? player.pause() : player.play())}></Pressable>

      {/* Slider for Seeking */}
      {/* <View style={styles.sliderContainer}>
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
      </View> */}
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

  const ITEM_HEIGHT = Dimensions.get("window").height;
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
        initialNumToRender={2}
        // maxToRenderPerBatch={2}
        windowSize={2}
        snapToAlignment="center"
        snapToInterval={ITEM_HEIGHT} // Replace with item height
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
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
