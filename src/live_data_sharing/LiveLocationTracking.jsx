import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import * as Location from 'expo-location'

import { 
  subscribesegment, 
  unsubscribesegment, 
  getpubsubsocketconn 
} from "../connections/pubsubsocket";

const LiveLocationTracking = () => { 

  const [ locationPermissionStatus, setLocationPermissionStatus ] = useState(false)
  const [ location, setLocation ] = useState({})
  
  useEffect(() => {  

    (async () => {

      //getting pubsubsocketconnection
      let pubsubsocketconn
      await getpubsubsocketconn().then((conn) => {
        pubsubsocketconn = conn
      }).catch((error) => {
        console.log(error)
      })

      //subscribing pub/sub socket segment
      await subscribesegment({
        segment: 'adjusterlivelocationtracking',
        pushtoemit: false,
        emitsegment: null
      }).then((message) => {
        console.log(message);
      }).catch((error) => {
        console.error(error);
      });


      //getting foreground location permission and location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionStatus(false);
        return;
      }
      setLocationPermissionStatus(true);

      if(pubsubsocketconn){

        //getting location
        let locationSubscription = await Location.watchPositionAsync(
          { 
            accuracy: Location.Accuracy.Highest, 
            timeInterval: 1000, 
            distanceInterval: 0.000001 
          },
          (location) => {
            setLocation({ 
              lastUpdated: location?.timestamp,
              originLatitude: location?.coords?.latitude,
              originLongitude: location?.coords?.longitude
            });
            
            //emitting location
            pubsubsocketconn.emit('publish', { 
              segment: 'adjusterlivelocationtracking', 
              message: { 
                originLatitude: location?.coords?.latitude, 
                originLongitude: location?.coords?.longitude, 
                adjusterId: 'adjusterid',
                lastUpdated: location?.timestamp
              }
            })
          }
        );

        return () => {
          locationSubscription.remove();          
          unsubscribesegment(`adjusterlivelocationtracking`).then(() => {
            console.log('Unsubscribed');
          }).catch((error) => {
            console.log(error)
          })          
        };
      }
      
    })();

    return () => {
      unsubscribesegment(`adjusterlivelocationtracking`).then(() => {
        console.log('Unsubscribed');
      }).catch((error) => {
        console.log(error)
      })
    };
  }, [])

  return (
    <View>
      <Text>Location permission status: {locationPermissionStatus ? 'true' : 'false'}</Text>
      <Text>---------------------------------------------------</Text>
      <Text>Timestamp: {location?.lastUpdated}</Text>
      <Text>Latitude: {location?.originLatitude}</Text>
      <Text>Longitude: {location?.originLongitude}</Text>
      <Text>---------------------------------------------------</Text>
    </View>
  )
}

export default LiveLocationTracking