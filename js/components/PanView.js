import React, { Component } from 'react';
import { View, PanResponder, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

export default class PanView extends Component {

    state = {
        viewX: 0,
        viewY: 0
    }

    lastMoveX = 0;
    lastMoveY = 0;
    viewWidth = 0;
    viewHeight = 0;
    childWidth = 0;
    childHeight = 0;

    constructor(props) {
        super(props);

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return gestureState.dx !== 0 || gestureState.dy !== 0;
            },
            onMoveShouldSetPanResponderCapture: () => false,

            onPanResponderGrant: (evt, gestureState) => {
                this.lastMoveX = gestureState.moveX;
                this.lastMoveY = gestureState.moveY;
            },
            onPanResponderMove: (evt, gestureState) => {
                let dx = gestureState.moveX - this.lastMoveX;
                let dy = gestureState.moveY - this.lastMoveY;

                this.setState(state => ({
                    viewX: state.viewX + dx,
                    viewY: state.viewY + dy
                }));

                this.enforcePanBoundaries();

                this.lastMoveX = gestureState.moveX;
                this.lastMoveY = gestureState.moveY;
            },
            onPanResponderTerminationRequest: () => true
        });
    }

    onViewLayout = (event) => {
        this.viewWidth = event.nativeEvent.layout.width;
        this.viewHeight = event.nativeEvent.layout.height;        
    }

    onChildLayout = (event) => {
        this.childWidth = event.nativeEvent.layout.width;
        this.childHeight = event.nativeEvent.layout.height;

        this.enforcePanBoundaries();
    }

    enforcePanBoundaries() {
        this.setState(state => ({
            viewX: Math.max(Math.min(state.viewX, 0), this.viewWidth - this.childWidth),
            viewY: Math.max(Math.min(state.viewY, 0), this.viewHeight - this.childHeight)
        }));
    }

    render() {
        const viewPosition = StyleSheet.create({
            topLeft: {
                top: this.state.viewY,
                left: this.state.viewX
            }
        });
        return <View style={[styles.view, this.props.style]} {...this._panResponder.panHandlers} onLayout={this.onViewLayout}>
            <View style={[styles.childWrapper, viewPosition.topLeft]} onLayout={this.onChildLayout}>
                {this.props.children}
            </View>
        </View>;
    }
}

const styles = StyleSheet.create({
    view: {
        overflow: 'hidden'
    },
    childWrapper: {
        position: 'absolute',
    }
});

PanView.propTypes = {
    style: PropTypes.any,
    children: PropTypes.node
}

