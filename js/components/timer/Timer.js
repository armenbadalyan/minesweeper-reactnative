import React, { PureComponent } from 'react';
import LCD from '../lcd/LCD';

export class Timer extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            secondsElapsed: 0
        }

        this.tick = this.tick.bind(this);
        this.timerID = null;
    }

    componentWillReceiveProps(nextProps) {
        switch (nextProps.status) {
            case 'inprogress':
                if (!this.timerID) {
                    this.startedAt = nextProps.startedAt;
                    this.tick();
                }
                break;
            case 'new':
                this.setState({
                    secondsElapsed: 0
                });
                if (this.timerID) {
                    clearTimeout(this.timerID);
                    this.timerID = null;
                }
                break;
            default:
                if (this.timerID) {
                    clearTimeout(this.timerID);
                    this.timerID = null;
                }
        }
    }

    tick() {
        this.setState({
            secondsElapsed: Math.floor((global.nativePerformanceNow() - this.startedAt)/1000)
        });
        this.timerID = setTimeout(this.tick, 100);
    }

    render() {
        return <LCD className="timer" value={this.state.secondsElapsed} />
    }
}

export default Timer;