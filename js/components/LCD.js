import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    StyleSheet
} from 'react-native';
import Icon from './Icon';


const MAX_LCD_VALUE = 999;
const digits = {
    d0: 'd_0',
    d1: 'd_1',
    d2: 'd_2',
    d3: 'd_3',
    d4: 'd_4',
    d5: 'd_5',
    d6: 'd_6',
    d7: 'd_7',
    d8: 'd_8',
    d9: 'd_9'
}

export default function LCD(props) {
    let d1,
        d2,
        d3,
        currentDigit,
        value = props.value;

    if (value > MAX_LCD_VALUE) {
        d1 = d2 = d3 = 'd9';
    }
    else if (value < 0) {
        d1 = d2 = d3 = 'd0';
    } 
    else {
        currentDigit = Math.floor(value / 100);
        d1 = `d${currentDigit}`;

        value -= currentDigit * 100;
        currentDigit = Math.floor(value / 10);
        d2 = `d${currentDigit}`;

        value -= currentDigit * 10;
        d3 = `d${value}`;
    }

    return <View style={styles.lcd}>
        <Icon style={styles.digit} fadeDuration={0} source={digits[d1]} />
        <Icon style={styles.digit} fadeDuration={0} source={digits[d2]} />
        <Icon style={styles.digit} fadeDuration={0} source={digits[d3]} />
    </View>
}

LCD.propTypes = {
    value: PropTypes.number
}

const styles = StyleSheet.create({
    lcd: {
        backgroundColor: '#000',
        width: 70,
        height: 40,
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderStyle: 'solid',
        borderLeftColor: '#808080',
        borderTopColor: '#808080',
        borderRightColor: '#fff',
        borderBottomColor: '#fff',
        padding: 2
    },
    digit: {
        width: 20,
        flex: 0
    },
});