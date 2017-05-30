import React, { PureComponent } from 'react';
import {
  Text,
  View,
  Image
} from 'react-native';
import Icon from '../icon/icon.js';
import Styles from './styles.js';


const digits = {
    d0: require('../../assets/d-0.png'),
    d1: require('../../assets/d-1.png'),
    d2: require('../../assets/d-2.png'),
    d3: require('../../assets/d-3.png'),
    d4: require('../../assets/d-4.png'),
    d5: require('../../assets/d-5.png'),
    d6: require('../../assets/d-6.png'),
    d7: require('../../assets/d-7.png'),
    d8: require('../../assets/d-8.png'),
    d9: require('../../assets/d-9.png')
}

class LCD extends PureComponent {
    render() {

    	let d1,
    		d2,
    		d3,
    		currentDigit,
    		value = this.props.value;

    	currentDigit = Math.floor(value / 100);
    	d1 = `d${currentDigit}`;

    	value -= currentDigit*100;
    	currentDigit = Math.floor(value / 10);
    	d2 = `d${currentDigit}`;

    	value -= currentDigit*10;
    	d3 = `d${value}`;

        return <View style={Styles.lcd}>
                <Image style={Styles.digit} source={digits[d1]} />
	        	<Image style={Styles.digit} source={digits[d2]} />
                <Image style={Styles.digit} source={digits[d3]} />	        	
        	   </View>
    }
}

export default LCD;