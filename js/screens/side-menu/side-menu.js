import React, {Component} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity
} from 'react-native';

import { rootNavigator } from '../game/game.js';
import styles from './styles.js';

export default class SideMenu extends Component {

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={ this.gotoLeaderBoard.bind(this) }>
          <Text style={styles.button}>Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={ this.gotoSettings.bind(this) }>
          <Text style={styles.button}>Settings</Text>
        </TouchableOpacity>
    </View>
    );
  }
  gotoLeaderBoard() {
    this.toggleDrawer();
    rootNavigator.push({
      screen: 'minesweeper.Leaderboard',
      backButtonTitle: '',
      title: 'Leaderboard'
    });
  }

  gotoSettings() {
    this.toggleDrawer();
  }

  toggleDrawer() {
    this.props.navigator.toggleDrawer({
      to: 'closed',
      side: 'left',
      animated: true
    });
  }
}