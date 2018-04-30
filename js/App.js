/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React from 'react';
import { StackNavigator } from 'react-navigation';
import MainScreen from './screens/main/MainScreen';
import GameScreen from './screens/game/GameScreen';
import LeaderboardScreen from './screens/leaderboard/LeaderboardScreen';

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
    return <RootStack />;
}