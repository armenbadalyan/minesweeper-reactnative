import React, { PureComponent } from 'react';
import { Cell } from './cell.js';
import Styles from './styles.js'

export class OpenCell extends PureComponent {

    render() {

    	const props = this.props;

        let icon = '',
        	styles = [Styles.openCell];
       
        if (props.exploded) {
        	icon = 'mine'
        	styles.push(Styles.explodedCell);
        }
        else if (this.props.mistake) {
            icon = 'mine-mistake';
        } 
        else if (props.hasMine) {
            icon = 'mine';

        }
        else if (this.props.minesAround > 0) {
            icon = 'mine-' + this.props.minesAround;
        }

        return <Cell icon={icon} style={styles} {...this.props}></Cell>
    }
}