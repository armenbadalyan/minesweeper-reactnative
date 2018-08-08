import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameText from '../../components/GameText';

export default function RankRow () {    
    return (<View style={styles.row}>
        <GameText>...</GameText>        
    </View>);
}


const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 10
    }
});