import React, { PureComponent } from 'react';
import { Cell } from '../cell';

import {
    View,
    StyleSheet
} from 'react-native';
import commonStyles from '../../shared/styles.js';


class Minefield extends PureComponent {

    cellLayouts = {};

    constructor(props) {
        super(props);

        this.state = {
            cellWidth: 20,
            cellHeight: 20,
            fieldWidth: 320,
            fieldHeight: 320
        }

        this.fieldDimensions = {
            width: 250,
            height: 250
        }

        this.calculateCellLayouts(props.field, 20, 20);
        //this.handleLayoutChange = this.handleLayoutChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.field.rows !== this.props.field.rows || nextProps.field.cols !== this.props.field.cols) {
            this.calculateCellLayouts(nextProps.field, this.state.cellWidth, this.state.cellHeight);
        }
    }

    handleLayoutChange(event) {
        this.fieldDimensions.width = event.nativeEvent.layout.width;
        this.fieldDimensions.height = event.nativeEvent.layout.height;
        this.calculateCellDimensions(this.fieldDimensions.width, this.fieldDimensions.height, this.props.field.rows, this.props.field.cols);
    }

    calculateCellDimensions(fieldWidth, fieldHeight, rows, cols) {
        let cellSize = fieldWidth / cols;

        this.calculateCellLayouts(this.props.field, cellSize, cellSize);

        this.setState({
            cellWidth: cellSize,
            cellHeight: cellSize,
            fieldWidth: cellSize * cols,
            fieldHeight: cellSize * rows
        });   
    }

    calculateCellLayouts = (field, cellWidth, cellHeight) => {
        const cells = field.cells;
        const cellKeys = Object.keys(cells)
        this.cellLayouts = {};
        cellKeys.forEach(key => {
            this.cellLayouts[key] = StyleSheet.create(
                {
                    layout: {
                        width: cellWidth,
                        height: cellHeight,
                        left: cells[key].col * cellWidth,
                        top: cells[key].row * cellHeight
                    }
                }
            );
        });
    }

    render() {

        let cells = null,
            fieldStyles = {
                height: this.state.fieldHeight,
                flexDirection: 'row',
                flexWrap: 'wrap'
            };
        console.log('minefield render');
        const time = Date.now();
        if (this.state.cellWidth && this.state.cellHeight) {
            cells = Object.keys(this.props.field.cells).map((id) => {
                const cell = this.props.field.cells[id];

                return <Cell
                    key={cell.id}
                    data={cell}
                    layoutStyles={this.cellLayouts[cell.id].layout}
                    onCellClick={this.props.onCellClick} onCellAltClick={this.props.onCellAltClick} />
            });
        }

        console.log('Minefield render', Date.now() - time);

        return <View style={commonStyles.border}>
            <View style={fieldStyles} className="minefield">
                {!!(this.state.fieldWidth && this.state.fieldHeight) && cells}
            </View>
        </View>;


    }
}

export default Minefield;