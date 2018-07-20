import React from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import GameText from './GameText';

export default function HighScores(props) {
    const { scores, style } = props;
    return (<View style={style}>
        <GameText style={styles.title}>HIGH SCORES</GameText>
        <View style={styles.scoreContainer}>
            <View style={styles.scoreRow}>
                {scores.map(s => {
                    return <View key={s.label} style={styles.scoreColumn}>
                        <GameText>{s.label}</GameText>
                        <GameText>{s.score}</GameText>
                    </View>
                })}
            </View>
        </View>
    </View>);
}

HighScores.propTypes = {
    scores: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        score: PropTypes.string
    })),
    style: PropTypes.any
}

const styles = StyleSheet.create({
    title: {
        marginBottom: 20,
        textAlign: 'center'
    },
    scoreContainer: {
        width: '70%'
    },
    scoreRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    scoreColumn: {
        flex: 1,
        alignItems: 'center'
    }

});