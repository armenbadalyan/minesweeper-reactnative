import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function GameText(props) {
    const {children, style, ...ownProps} = props;
    return <Text {...ownProps} style={[styles.ownStyle, style]}>{children}</Text>
}

const styles = StyleSheet.create({
    ownStyle: {
        fontFamily: 'PressStart2P-Regular',
    }
});
