import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    statusBar: {
        height: Platform.OS === 'ios' ? 20 : 25 
    }
});

class StatusBarPlaceholder extends PureComponent {
    render() {
        return <View style={styles.statusBar} />
    }
}

export default StatusBarPlaceholder;