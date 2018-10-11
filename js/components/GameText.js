import React from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';

export default function GameText(props) {
    const {children, style, ...ownProps} = props;
    return <Text {...ownProps} style={[styles.ownStyle, style]}>{children}</Text>
}

GameText.propTypes = {
    children: PropTypes.node,
    style: PropTypes.any
}

const styles = StyleSheet.create({
    ownStyle: {
        fontFamily: 'PressStart2P-Regular'
    }
});
