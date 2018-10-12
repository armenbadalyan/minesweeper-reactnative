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
        const isPressed = this.props.selected || this.state.isPressed;
        const button = (<View style={[styles.button, isPressed ? styles.buttonPressed : null, this.props.style]}>
            <Text style={[styles.title, this.props.titleStyle]}>{this.props.title}</Text>
        </View>);
        if (this.props.touchable) {
            return (<TouchableWithoutFeedback onPressIn={this.onPressIn} onPressOut={this.onPressOut} onPress={this.props.onPress}>
                { button }
            </TouchableWithoutFeedback>);
        }
        else {
            return button;
        }
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
        justifyContent: 'center',
        paddingLeft: 5,
        paddingRight: 5
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

Button.defaultProps = {
    touchable: true
}

Button.propTypes = {
    title: PropTypes.string,
    onPress: PropTypes.func,
    style: PropTypes.any,
    titleStyle: PropTypes.any,
    touchable: PropTypes.bool,
    selected: PropTypes.bool
}