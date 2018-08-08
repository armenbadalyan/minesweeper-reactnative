import React, { PureComponent } from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';
import Icon from '../Icon.js';
import Styles from './styles.js';


export class Cell extends PureComponent {

    cellStyles = [Styles.cell];

    constructor(props) {
        super(props);


        this.handlePress = this.handlePress.bind(this);
        this.handleLongPress = this.handleLongPress.bind(this);

        this.cellStyles.push(this.props.layoutStyles);

    }

    handlePress() {
        if (this.props.onCellClick) {
            this.props.onCellClick(this.props.data.id);
        }
    }

    handleLongPress() {
        if (this.props.onCellAltClick) {
            this.props.onCellAltClick(this.props.data.id);
        }
    }

    render() {

        const cell = this.props.data;
        const flavorStyles = [];

        let icon = '';

        if (cell.closed) {
            if (cell.flagged) {
                icon = 'flag';
            }
        }
        else {
            flavorStyles.push(Styles.openCell);

            if (cell.exploded) {
                icon = 'mine'
                flavorStyles.push(Styles.explodedCell);
            }
            else if (cell.mistake) {
                icon = 'mine_mistake';
            }
            else if (cell.mine) {
                icon = 'mine';
            }
            else if (cell.minesAround > 0) {
                icon = 'mine_' + cell.minesAround;
            }
        }

        return (<TouchableWithoutFeedback  onPress={this.handlePress} onLongPress={this.handleLongPress}>
            <View style={[this.cellStyles, flavorStyles]}>
                <Icon source={icon} />			
            </View>
        </TouchableWithoutFeedback>);

    }
}
