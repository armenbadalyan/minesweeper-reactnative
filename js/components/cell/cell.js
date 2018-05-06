import React, { PureComponent } from 'react';
import { View, Image, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Icon from '../icon/icon.js';
import Styles from './styles.js';

const icons = {
    'mine-1': require('../../assets/mine-1.png'),
    'mine-2': require('../../assets/mine-2.png'),
    'mine-3': require('../../assets/mine-3.png'),
    'mine-4': require('../../assets/mine-4.png'),
    'mine-5': require('../../assets/mine-5.png'),
    'mine-6': require('../../assets/mine-6.png'),
    'mine-7': require('../../assets/mine-7.png'),
    'mine-8': require('../../assets/mine-8.png'),
    'mine': require('../../assets/mine.png'),
    'mine-mistake': require('../../assets/mine-mistake.png'),
    'flag': require('../../assets/flag.png')
}


export class Cell extends PureComponent {

    constructor(props) {
        super(props);


        this.handlePress = this.handlePress.bind(this);
        this.handleLongPress = this.handleLongPress.bind(this);
    }

    handlePress() {
        if (this.props.onCellClick) {
            this.props.onCellClick(this.props.data.id);
        }
    }

    handleLongPress() {
        if (this.props.onCellAltClick) {
            this.props.onCellAltClick(this.props.data.id);
        }
    }

    render() {

        const cell = this.props.data;
        const styles = [Styles.cell, this.props.layoutStyles];


        let icon = '';

        if (cell.closed) {
            if (cell.flagged) {
                icon = 'flag';
            }
        }
        else {
            styles.push(Styles.openCell);

            if (cell.exploded) {
                icon = 'mine'
                styles.push(Styles.explodedCell);
            }
            else if (cell.mistake) {
                icon = 'mine-mistake';
            }
            else if (cell.mine) {
                icon = 'mine';
            }
            else if (cell.minesAround > 0) {
                icon = 'mine-' + cell.minesAround;
            }
        }

        return (<TouchableWithoutFeedback  onPress={this.handlePress} onLongPress={this.handleLongPress}>
            <View style={styles}>
                <Icon style={Styles.cellIcon} source={icons[icon]} />			
            </View>
        </TouchableWithoutFeedback>);

    }
}
