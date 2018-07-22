import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { BG_MAIN_COLOR, BG_ALT_COLOR, BORDER1_COLOR, BORDER2_COLOR } from '../constants';

export default class Button extends Component {

    state = {
        isPressed: false
    }

    onPressIn = () => {
        this.setState({
            isPressed: true
        });
    }

    onPressOut = () => {
        this.setState({
            isPressed: false
        });
    }

    render() {
        return (<TouchableWithoutFeedback onPress={this.props.onPress} onPressIn={this.onPressIn} onPressOut={this.onPressOut}>
            <View style={[styles.button, this.state.isPressed ? styles.buttonPressed : null, this.props.style]}><Text style={styles.title}>{this.props.title}</Text></View>
        </TouchableWithoutFeedback>);
    } 
}

const styles = StyleSheet.create({
    button: {
        height: 40,
        backgroundColor: BG_MAIN_COLOR,
        borderWidth: 3,
        borderStyle: 'solid',
        borderLeftColor: BORDER1_COLOR,
        borderTopColor: BORDER1_COLOR,
        borderRightColor: BORDER2_COLOR,
        borderBottomColor: BORDER2_COLOR,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonPressed: {
        borderLeftColor: BG_ALT_COLOR,
        borderTopColor: BG_ALT_COLOR,
        backgroundColor: BG_ALT_COLOR
    },
    title: {
        color: '#FF0000',
        fontSize: 14,
        fontFamily: 'PressStart2P-Regular',
        lineHeight: 14,
        paddingTop: 2
    }
})

Button.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.number
}