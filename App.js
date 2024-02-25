import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { initializepubsubsocket } from './src/connections/pubsubsocket';
import LiveLocationTracking from './src/live_data_sharing/LiveLocationTracking';

export default function App() {

  const [ isPubSubSocketConnected, setIsPubSubSocketConnected ] = useState(false)

  useEffect(() => {
    initializepubsubsocket().then(() => {
      console.log(`Pub/Sub Socket Connected Successfully!`);
      setIsPubSubSocketConnected(true)
    }).catch((error) => {
      console.log(error);
    })
    return 
  }, [])

  return (
    <View style={styles.container}>
      
      <StatusBar style="auto" />
      
      {isPubSubSocketConnected 
        ? <LiveLocationTracking/> 
        : <Text>Loading....</Text>
      }

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'skyblue',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
