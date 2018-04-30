import React, { PureComponent } from 'react';
import LCD from '../lcd/lcd.js';
//import './timer.css'

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
        default:
            if (this.timerID) {
                clearTimeout(this.timerID);
                this.timerID = null;
            }
        }
    }

    tick() {
        this.setState({
            secondsElapsed: Math.floor((new Date() - this.startedAt) / 1000)
        });
        this.timerID = setTimeout(this.tick, 1000);
    }

    render() {   	

        return <LCD className="timer" value={this.state.secondsElapsed} />
	        	
    }
}

export default Timer;