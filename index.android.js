/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import { Navigation } from 'react-native-navigation';
import { registerScreens } from './app/pages';

registerScreens();

Navigation.startSingleScreenApp({
  screen: {
    screen: 'minesweeper.Game',
    title: 'Minesweeper'
  },
  drawer: {
    left: {
      screen: 'minesweeper.SideMenu'
    }
  }
});
