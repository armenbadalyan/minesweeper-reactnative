import React, { PureComponent } from 'react';
import {
  Image,
  StyleSheet
} from 'react-native';

class Icon extends PureComponent {

	render() {
		return !!this.props.source && <Image width={this.props.width}
			height={this.props.height} 
			style={[styles.icon, this.props.style]} 
			fadeDuration={0} 
			source={{uri: this.props.source}} /> 
	}
}

export default Icon;

const styles = StyleSheet.create({
	icon: {
		flex:1
	}
});