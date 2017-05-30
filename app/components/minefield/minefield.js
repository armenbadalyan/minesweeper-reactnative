import React, { PureComponent } from 'react';
import { OpenCell, ClosedCell } from '../cell';
import {  
  View
} from 'react-native';
import commonStyles from '../../shared/styles.js'

class Minefield extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            cellWidth: 0,
            cellHeight: 0,
            fieldHeight: 0
        }

        this.fieldDimensions = {
            width: 0,
            height: 0
        }

        this.handleLayoutChange = this.handleLayoutChange.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.calculateCellDimensions(this.fieldDimensions.width, this.fieldDimensions.height, nextProps.field.rows, nextProps.field.cols);
    }

    handleLayoutChange(event) {
        this.fieldDimensions.width = event.nativeEvent.layout.width;
        this.fieldDimensions.height = event.nativeEvent.layout.height;
        this.calculateCellDimensions(this.fieldDimensions.width, this.fieldDimensions.height, this.props.field.rows, this.props.field.cols);
    }

    calculateCellDimensions(fieldWidth, fieldHeight, rows, cols) {
        let cellSize = fieldWidth / cols;
        
        this.setState({
        	cellWidth: cellSize,
            cellHeight: cellSize,
            fieldHeight: cellSize * rows
        })
    }

    render() {       

    	let cells = null,
    		fieldStyles =  {
    			height: this.state.fieldHeight
    		};

        if (this.state.cellWidth && this.state.cellHeight) {            
            cells = Object.keys(this.props.field.cells).map((id) => {
                const cell = this.props.field.cells[id];
                if (cell.closed) {
                    return <ClosedCell
                        key={cell.id}
                        cellId={cell.id}
                        row={cell.row}
                        col={cell.col}
                        flagged={cell.flagged}                        
                        width={this.state.cellWidth}
                        height={this.state.cellHeight}
                        onCellClick={this.props.onCellClick} onCellAltClick={this.props.onCellAltClick} />
                } else {
                    return <OpenCell
                        key={cell.id}
                        cellId={cell.id}
                        row={cell.row}
                        col={cell.col}
                        exploded={cell.exploded}       
                        mistake={cell.mistake}                 
                        minesAround={cell.minesAround}
                        hasMine={cell.mine}
                        width={this.state.cellWidth}
                        height={this.state.cellHeight}
                        onCellClick={this.props.onCellClick} onCellAltClick={this.props.onCellAltClick} />
                }
            });
        }

        return <View style={commonStyles.border}>
        			<View style={fieldStyles} className="minefield" onLayout={this.handleLayoutChange}>{cells}</View>
            	</View>;

        
    }
}

export default Minefield;