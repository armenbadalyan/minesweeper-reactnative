import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatGameTime } from '../../shared/time-utils';
import GameText from '../../components/GameText';

export default function RankRow (props) {
    const { rank, score } = props;
    return (<View style={styles.row}>
        <GameText style={styles.rank}>{rank}</GameText>
        <GameText style={styles.playerName} >{score.user.displayName}</GameText>
        <GameText style={styles.score}>{formatGameTime(score.score, 2)}</GameText>
    </View>);
}

RankRow.propTypes = {
    rank: PropTypes.number,
    score: PropTypes.shape({
        score: PropTypes.number,
        user: PropTypes.shape({
            displayName: PropTypes.string
        })
    }),
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    rank: {
        width: 40,
        fontSize: 10
    },
    playerName: {
        flex: 1,
        textAlign: 'left',
        fontSize: 10
    },
    score: {
        width: 80,
        textAlign: 'right',
        fontSize: 10
    }
});