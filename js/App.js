/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react';
import { StackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import store from './modules/store';
import MainScreen from './screens/main/MainScreen';
import GameScreen from './screens/game/GameScreen';
import LeaderboardScreen from './screens/leaderboard/LeaderboardScreen';
import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue.js';

const RootStack = StackNavigator(
    {
        Main: {
            screen: MainScreen,
        },
        Game: {
            screen: GameScreen,
        },
        Leaderboard: {
            screen: LeaderboardScreen
        }
    },
    {
        initialRouteName: 'Main',
        navigationOptions: {
            header: null
        }
    }
);

export default function App() {
    return <Provider store={store}><RootStack /></Provider>;
}

const spyFunction = (msg) => {
    console.log(msg);
  };
  
  //MessageQueue.spy(spyFunction);