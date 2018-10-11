import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import LCD from './LCD';
import { GameStatus } from '../modules/game';

export default class Timer extends PureComponent {

    timerID = null;
    state = {
        secondsElapsed: 0
    };

    componentDidMount() {
        this.tick();
    }

    componentWillUnmount() {
        this.stopTick();
    }

    tick = () => {
        if (this.props.status === GameStatus.NEW) {
            this.setState({
                secondsElapsed: 0
            });
        }
        else if (this.props.status === GameStatus.IN_PROGRESS) {
            this.setState({
                secondsElapsed: Math.min(Math.floor((global.nativePerformanceNow() - this.props.startedAt) / 1000), MAX_LCD_VALUE)
            });
        }        
        else {
            this.setState({
                secondsElapsed: Math.min(Math.floor((this.props.finishedAt - this.props.startedAt) / 1000), MAX_LCD_VALUE)
            });            
        }
        
        this.timerID = setTimeout(this.tick, 100);
    }

    stopTick = () => {
        if (this.timerID) {
            clearTimeout(this.timerID);
        }
    }

    render() {
        return <LCD className="timer" value={this.state.secondsElapsed} />
    }
}

Timer.propTypes = {
    status: PropTypes.string,
    startedAt: PropTypes.number,
    finishedAt: PropTypes.number
}

const MAX_LCD_VALUE = 999;