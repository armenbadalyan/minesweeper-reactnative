import React, { PureComponent } from 'react';
import { View, Image, TouchableHighlight, StyleSheet } from 'react-native';
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
            this.props.onCellClick(this.props.cellId);
        }
    }

    handleLongPress(e) {        
        if (this.props.onCellAltClick) {
            this.props.onCellAltClick(this.props.cellId);
        }
    }

    render() {
        let className = this.props.className || '',
            ownStyle = StyleSheet.create({
            	layout: {
            		width: this.props.width,
                	height: this.props.height,
                	left: this.props.col * this.props.width,
                	top: this.props.row * this.props.height
            	}                
        	}),
        	style = this.props.style || [];

        return <TouchableHighlight style={[Styles.cell, ...style, ownStyle.layout]} onPress={this.handlePress} onLongPress={this.handleLongPress}>
	        		<View style={{flex:1}}>
						<Icon style={Styles.cellIcon} source={icons[this.props.icon]} />			
					</View>
				</TouchableHighlight>
    }
}