import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { formatGameTime } from '../../shared/time-utils';
import GameText from '../../components/GameText';

export default function RankRow (props) {
    const { rank, score, isMe } = props;
    let playerStyles = [styles.playerName];
    if (isMe) {
        playerStyles.push(styles.me);
    }
    return (<View style={styles.row}>
        <GameText style={[styles.rank, isMe ? styles.me : null]}>{rank}</GameText>
        <GameText style={[styles.playerName, isMe ? styles.me : null]} ellipsizeMode="tail" numberOfLines={1}>{score.user.displayName}</GameText>
        <GameText style={[styles.score, isMe ? styles.me : null]} ellipsizeMode="tail" numberOfLines={1}>{formatGameTime(score.score, 2)}</GameText>
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
    isMe: PropTypes.bool
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    rank: {
        minWidth: 35,
        fontSize: 10
    },
    playerName: {
        flex: 1,
        textAlign: 'left',
        fontSize: 10,
        paddingLeft: 10,
        paddingRight: 10
    },
    me: {
        color: 'green'
    },
    score: {
        width: 80,
        textAlign: 'right',
        fontSize: 10
    }
});