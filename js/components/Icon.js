import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  StyleSheet,
  ViewPropTypes
} from 'react-native';

export default class Icon extends PureComponent {

	render() {
		let source;

		if (this.props.externalSource) {
			source = this.props.source;
		}
		else {
			source = {
				uri: this.props.source
			}
		}

		return !!this.props.source && <Image width={this.props.width}
			height={this.props.height} 
			style={[styles.icon, this.props.style]} 
			fadeDuration={0}
			resizeMethod="resize"
			source={source} /> 
	}
}

Icon.propTypes = {
	source: PropTypes.oneOf(PropTypes.string, PropTypes.number),
	width: PropTypes.number,
	height: PropTypes.number,
	style: ViewPropTypes.style,
	externalSource: PropTypes.bool
}

const styles = StyleSheet.create({
	icon: {
		flex:1,
		width: '100%',
		height: '100%'
	}
});