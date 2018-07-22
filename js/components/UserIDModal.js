import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, View, TextInput, StyleSheet } from 'react-native';
import Button from './Button';
import GameText from './GameText';

export default class UserIDModal extends Component {

    state = {
        visible: false
    }

    show() {
        this.setState({
            visible: true
        });
    }

    hide() {
        this.setState({
            visible: false
        });
    }

    onSubmit() {
        this.props.onSubmit(this.input.value);
    }

    onRequestClose() {
        this.hide();
    }

    render() {
        return (<Modal visible={this.state.visible}
            transparent={true}
            style={styles.outer}
            onRequestClose={this.onRequestClose}
        >
            <View style={styles.outer}>
                <View style={styles.inner}>
                    <GameText style={styles.message}>The world wants to know its hero!</GameText>
                    <TextInput ref={(ref => this.input = ref)} defaultValue={this.props.defaultValue} />
                    <Button title='Save' onPress={this.props.onSubmit} />
                </View>                
            </View>
        </Modal>);
    }
}

UserIDModal.propTypes = {
    isShown: PropTypes.bool,
    userName: PropTypes.string,
    onSubmit: PropTypes.func
}

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 30,
        marginRight: 30       
    },
    inner: {
        flexDirection: 'column',
        backgroundColor: '#C0C0C0',
        alignItems: 'stretch',
        padding: 20
    },
    message: {
        textAlign: 'center'
    }
});