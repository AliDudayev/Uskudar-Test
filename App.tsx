import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';


import { Provider } from 'react-redux'
import { store } from './src/redux/store'
import ProductsList from './src/screens/homeScreen'
import ProductDetails from './src/screens/detailScreen'
import Test from './src/screens/test'

const Stack = createNativeStackNavigator()

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={ProductsList}/>
          <Stack.Screen name="Details" component={ProductDetails} />
          <Stack.Screen name="Test" component={Test} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  )
}

export default App

const styles = StyleSheet.create({})