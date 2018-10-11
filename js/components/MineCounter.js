import React from 'react';
import PropTypes from 'prop-types';
import LCD from './LCD';

export default function MineCounter(props) {
    return <LCD value={props.minesRemaining} />;
}

MineCounter.propTypes = {
    minesRemaining: PropTypes.number
}