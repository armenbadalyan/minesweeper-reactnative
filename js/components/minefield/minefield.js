import React, { PureComponent } from 'react';
import Canvas, { Image as CanvasImage } from 'react-native-canvas';
import { Cell } from '../cell';
import {mine} from '../../assets/base64Images.json';

import {
    View,
    Image,
    TouchableWithoutFeedback,
    Platform,
    StyleSheet,
} from 'react-native';
import commonStyles from '../../shared/styles.js';

const FIELD_BORDER_WIDTH = 6;

export default class Minefield extends PureComponent {

    cellLayouts = {};
    canvas = null;
    imagesLoaded = false;
    mineImage;

    constructor(props) {
        super(props);

        this.state = {
            cellWidth: 0,
            cellHeight: 0,
            fieldWidth: 0,
            fieldHeight: 0
        }

        //this.calculateCellLayouts(props.field, 20, 20);
        //this.handleLayoutChange = this.handleLayoutChange.bind(this);
    }


    /*setRef = (canvas) => {
        if (!this.canvas) {
            this.canvas = canvas;
            this.loadImages();
        }        
    }

    loadImages = () => {
        this.mineImage = new CanvasImage(this.canvas);
        this.mineImage.src = mine;
        this.mineImage.addEventListener('load', () => {
            this.imagesLoaded = true;
        })
    }*/

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.field.rows !== this.props.field.rows || nextProps.field.cols !== this.props.field.cols) {
            this.calculateCellLayouts(nextProps.field, this.state.cellWidth, this.state.cellHeight);
        }

        /*if (nextProps.field !== this.props.field) {
            this.renderField(nextProps.field);
        }*/
    }

    handleLayoutChange = (event) => {
        this.calculateCellDimensions(event.nativeEvent.layout.width, event.nativeEvent.layout.height, this.props.field.rows, this.props.field.cols);
    }

    calculateCellDimensions(fieldWidth, fieldHeight, rows, cols) {
        let cellSize = (fieldWidth - FIELD_BORDER_WIDTH * 2) / cols;

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

    onFieldPress = (event) => {
        const nativeEvent = event.nativeEvent;
        const cell = this.getCellUnderCoord(nativeEvent.locationX, nativeEvent.locationY);
        if (cell) {
            this.props.onCellClick(cell.id);
        }

    }

    onFieldLongPress = (event) => {
        const nativeEvent = event.nativeEvent;
        const cell = this.getCellUnderCoord(nativeEvent.locationX, nativeEvent.locationY);
        if (cell) {
            this.props.onCellAltClick(cell.id);
        }
    }

    getCellUnderCoord = (x, y) => {
        let cellX, cellY;
        const field = this.props.field;
        if (field) {
            cellX = Math.floor(x / this.state.cellWidth);
            cellY = Math.floor(y / this.state.cellHeight);

            return field.cells[cellY + ':' + cellX] || null;
        }
        else {
            return null;
        }
    }

    /*renderField(field) {
        if (this.canvas && this.imagesLoaded) {
            this.canvas.width = this.state.fieldWidth;
            this.canvas.height = this.state.fieldHeight;
            Object.values(field.cells).forEach((cell) => {
                this.renderCell(cell)
            });
        }
    }

    renderCell(cell) {
        const ctx = this.canvas.getContext('2d');
        const x = cell.col * this.state.cellWidth;
        const y = cell.row * this.state.cellHeight;
        let fill,
            image;



        if (cell.closed) {
            if (cell.flagged) {
                fill = 'green';
            }
        }
        else {
            fill = 'gray';
            if (cell.exploded) {
                fill = 'red';
            }
            else if (cell.mistake) {
                fill = 'red';
            }
            else if (cell.mine) {
                fill = 'black';
                image = this.mineImage;
            }
            else if (cell.minesAround > 0) {
                fill = 'blue'
            }
        }

        if (fill) {
            ctx.fillStyle = fill;
            ctx.fillRect(x, y, this.state.cellWidth, this.state.cellHeight);
        }

        if (image) {
            ctx.drawImage(image, x, y, this.state.cellWidth, this.state.cellHeight);
        }

    }*/

    render() {

        const fieldStyles = StyleSheet.create({
            dimensions: {
                width: this.state.fieldWidth,
                height: this.state.fieldHeight
            }            
        });
        let cells = null;

        if (this.state.cellWidth && this.state.cellHeight) {
            cells = Object.keys(this.props.field.cells).map((id) => {
                const cell = this.props.field.cells[id];

                if (!cell.closed || cell.flagged) {
                    return <Cell
                        key={cell.id}
                        data={cell}
                        width={this.state.cellWidth}
                        height={this.state.cellHeight}
                        x={this.state.cellWidth * cell.row}
                        y={this.state.cellHeight * cell.row}
                        layoutStyles={this.cellLayouts[cell.id].layout}
                        onCellClick={this.props.onCellClick} onCellAltClick={this.props.onCellAltClick} />
                }
                else {
                    return null;
                }
            });
        }

        return <View style={commonStyles.border} onLayout={this.handleLayoutChange} >
            <TouchableWithoutFeedback onPress={this.onFieldPress} onLongPress={this.onFieldLongPress}>
                <View style={fieldStyles.dimensions} >
                    <Image source={{ uri: 'field_16_16' }} style={fieldStyles.dimensions} />
                    {!!(this.state.fieldWidth && this.state.fieldHeight) && cells}
                </View>
            </TouchableWithoutFeedback>
        </View>;


    }
}
