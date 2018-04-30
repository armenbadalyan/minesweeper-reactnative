import React, { PureComponent } from 'react';
import {
  Image,
  StyleSheet
} from 'react-native';

class Icon extends PureComponent {

	constructor(props) {
		super(props);

		this.iconStyles = StyleSheet.create({
			icon: {
				flex:1,
				resizeMode: 'contain',
				width: undefined,
				height: undefined
			}
		});
	}

	render() {
		return <Image style={[this.props.style, this.iconStyles.icon]} fadeDuration={0} source={this.props.source} /> 
	}
}

export default Icon;