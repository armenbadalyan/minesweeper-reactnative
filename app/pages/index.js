import { Navigation } from 'react-native-navigation';

import { Game } from './game/game.js';
import Leaderboard from './leaderboard/leaderboard.js';
import SideMenu from './side-menu/side-menu.js';

// register all screens of the app (including internal ones)
export function registerScreens() {
  Navigation.registerComponent('minesweeper.Game', () => Game);
  Navigation.registerComponent('minesweeper.Leaderboard', () => Leaderboard);
  Navigation.registerComponent('minesweeper.SideMenu', () => SideMenu);
}