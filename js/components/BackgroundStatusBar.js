import React from 'react';
import { View, StatusBar, StyleSheet, Platform } from 'react-native';


export default function BackgroundStatusBar(props) {
    const { backgroundColor } = props;
    return <View style={[styles.statusBar, {backgroundColor: backgroundColor}]}>
        <StatusBar {...props} />
    </View>
}

BackgroundStatusBar.propTypes = {
    ...StatusBar.propTypes
}

const styles = StyleSheet.create({
    statusBar: {
        height: (Platform.OS === 'ios') ? 20 : 0
    }    
});