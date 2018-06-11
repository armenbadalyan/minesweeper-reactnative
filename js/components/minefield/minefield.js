import React, { PureComponent } from 'react';
import { WebGLView } from "react-native-webgl";
import { Cell } from '../cell';
import { GameStatus } from '../../modules/game';
import TextManager from '../../shared/texture-manager';
import {
    View,
    AppState,
    TouchableWithoutFeedback,
    StyleSheet
} from 'react-native';
import commonStyles from '../../shared/styles.js';
import TextureManager from '../../shared/texture-manager';
import { BG_MAIN_COLOR } from '../../constants';

const FIELD_BORDER_WIDTH = 6;
const textures = [{
    name: 'field_assets',
    source: 'field_assets'
}];
const assets = {
    mine1: {
        offsetX: 0.0,
        offsetY: 0.0
    },
    mine2: {
        offsetX: 0.25,
        offsetY: 0.0
    },
    mine3: {
        offsetX: 0.5,
        offsetY: 0.0
    },
    mine4: {
        offsetX: 0.75,
        offsetY: 0.0
    },
    mine5: {
        offsetX: 0.0,
        offsetY: 0.25
    },
    mine6: {
        offsetX: 0.25,
        offsetY: 0.25
    },
    mine7: {
        offsetX: 0.5,
        offsetY: 0.25
    },
    mine8: {
        offsetX: 0.75,
        offsetY: 0.25
    },
    mine: {
        offsetX: 0.0,
        offsetY: 0.5
    },
    mineMistake: {
        offsetX: 0.25,
        offsetY: 0.5
    },
    mineExploded: {
        offsetX: 0.5,
        offsetY: 0.5
    },
    flag: {
        offsetX: 0.75,
        offsetY: 0.5
    },
    empty: {
        offsetX: 0.0,
        offsetY: 0.75
    },
    closed: {
        offsetX: 0.25,
        offsetY: 0.75
    }

};
const assetsPerRow = 4;

export default class Minefield extends PureComponent {

    cellLayouts = {};
    gl = null;
    texturesLoaded = false;
    program;

    constructor(props) {
        super(props);

        this.state = {
            appState: 'active',
            gameFieldReady: false,
            cellWidth: 0,
            cellHeight: 0,
            fieldWidth: 0,
            fieldHeight: 0
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onAppStateChanged);
    }

    componentWillUnmount() {
        this.unloadTextures();
        AppState.removeEventListener('change', this.onAppStateChanged);
    }   

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.field.rows !== this.props.field.rows || nextProps.field.cols !== this.props.field.cols) {
            this.calculateCellLayouts(nextProps.field, this.state.cellWidth, this.state.cellHeight);
        }

        this.renderField(nextProps.field, nextProps.status);
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

    onContextCreate = (gl) => {
        this.gl = gl;

        TextManager.loadTextures(gl, textures).then(() => {
            this.texturesLoaded = true;
            this.createShaders();
            this.renderField(this.props.field, this.props.status);
            this.setState({gameFieldReady: true});
        }).catch(err => {
            console.log(err);
        });
    }

    onAppStateChanged = (nextAppState) => {
        // when pausing unload textures to prevent black square/flickering problems after resume
        if (nextAppState !== 'active') {
            this.unloadTextures();
        }
        
        this.setState({appState: nextAppState});
    }

    loadTextures() {
        TextManager.loadTextures(this.gl, textures);
    }

    initField() {
        if (this.gl) {
            this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        }
    }

    createShaders() {
        const gl = this.gl;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(
            vertexShader,
            `\
            attribute vec2 aVertexPosition;
            //attribute vec4 color;
            attribute vec2 aTexCoord;

            //varying vec4 vColor;
            varying vec2 vTexCoord;

            void main() {
                gl_Position = vec4(aVertexPosition, 0.0, 1.0);
                //vColor = color;
                vTexCoord = aTexCoord;
            }
            `
        );
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(
            fragmentShader,
            `\
            #ifdef GL_ES
            precision highp float;
            #endif
            
            //varying vec4 vColor;

            // Passed in from the vertex shader.
            varying vec2 vTexCoord;

            // sampler
            uniform sampler2D t;
            
            void main() {
                gl_FragColor = texture2D(t, vTexCoord);
            }`
        );
        gl.compileShader(fragmentShader);
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

    }

    renderField(field, status) {
        const gl = this.gl;
        const program = this.program;

        if (gl && this.texturesLoaded) {

            if (status === GameStatus.NEW) {
                this.initField();
            }

            //this.cellGeometry = new Float32Array([]);
            //this.cellColors = new Float32Array([]);

            let cellGeometry = [];
            let colors = [];
            let texturePoints = [];

            Object.values(field.cells).forEach((cell) => {
                this.renderCell(cell, cellGeometry, colors, texturePoints)
            });

            // Create an empty buffer object and store vertex data
            const vbuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cellGeometry), gl.STATIC_DRAW);

            // Create an empty buffer object and store color data
            /*const colorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);*/

            // Create an empty buffer object and store color data
            const textureBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturePoints), gl.STATIC_DRAW);

            const itemSize = 2;
            const numItems = cellGeometry.length / itemSize;

            /*program.uColor = gl.getUniformLocation(program, "uColor");
            gl.uniform4fv(program.uColor, [0, 0, 1, 1]);*/

            // vertex position attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
            program.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
            gl.enableVertexAttribArray(program.aVertexPosition);
            gl.vertexAttribPointer(program.aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);

            // color attribute
            /*gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            program.color = gl.getAttribLocation(program, "color");
            gl.vertexAttribPointer(program.color, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.color);*/

            // texture coordinate attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            program.textureCoord = gl.getAttribLocation(program, "aTexCoord");
            gl.vertexAttribPointer(program.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.textureCoord);

            const uSampler = gl.getUniformLocation(program, "t");

            // map the texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, TextureManager.getTexture('field_assets'));
            gl.uniform1i(uSampler, 0);

            gl.drawArrays(gl.TRIANGLES, 0, numItems);

            const rngl = this.gl.getExtension("RN");
            rngl.endFrame();
        }
    }

    renderCell(cell, vertices, colors, textureCoords) {

        const x = this.toGLX(cell.col * this.state.cellWidth);
        const y = this.toGLY(cell.row * this.state.cellHeight);
        const cw = this.scaleToGLWidth(this.state.cellWidth);
        const ch = this.scaleToGLHeight(this.state.cellHeight);

        let asset;

        vertices.push(x, y,
            x + cw, y,
            x, y - ch,
            x, y - ch,
            x + cw, y,
            x + cw, y - ch);

        if (cell.closed) {
            if (cell.flagged) {
                asset = assets['flag'];
            }
            else {
                asset  = assets['closed'];
            }
        }
        else {
            if (cell.exploded) {
                asset = assets['mineExploded'];
            }
            else if (cell.mistake) {
                asset = assets['mineMistake'];
            }
            else if (cell.mine) {
                asset = assets['mine'];
            }
            else if (cell.minesAround > 0) {
                asset = assets['mine' + cell.minesAround];
            }
            else {
                asset = assets['empty'];
            }
        }

        textureCoords.push(
            this.getAssetX(0.0, asset), this.getAssetY(0.0, asset),
            this.getAssetX(1.0, asset), this.getAssetY(0.0, asset),
            this.getAssetX(0.0, asset), this.getAssetY(1.0, asset),

            this.getAssetX(0.0, asset), this.getAssetY(1.0, asset),
            this.getAssetX(1.0, asset), this.getAssetY(0.0, asset),
            this.getAssetX(1.0, asset), this.getAssetY(1.0, asset)
        );
    }

    unloadTextures = () => {
        TextureManager.unloadTextures(this.gl, textures);
        this.texturesLoaded = false;
    }

    getAssetX(x, asset) {
        return x / assetsPerRow + asset.offsetX;
    }

    getAssetY(y, asset) {
        return y / assetsPerRow + asset.offsetY;
    }

    toGLX(x) {
        return 2 * x / this.state.fieldWidth - 1;
    }

    toGLY(y) {
        return 1 - 2 * y / this.state.fieldHeight;
    }

    scaleToGLWidth(width) {
        return (2 * width) / this.state.fieldWidth;
    }

    scaleToGLHeight(height) {
        return (2 * height) / this.state.fieldHeight;
    }

    render() {

        const fieldStyles = StyleSheet.create({
            dimensions: {
                width: this.state.fieldWidth,
                height: this.state.fieldHeight
            }
        });

        return <View style={commonStyles.border} onLayout={this.handleLayoutChange} >
            <TouchableWithoutFeedback onPress={this.onFieldPress} onLongPress={this.onFieldLongPress}>
                <View style={fieldStyles.dimensions} >
                    <View>
                        { this.state.appState === 'active' ? <WebGLView style={fieldStyles.dimensions} onContextCreate={this.onContextCreate} /> : null }
                    </View>                    
                    
                </View>
            </TouchableWithoutFeedback>
            { !this.state.gameFieldReady && <View style={styles.fieldOverlay} />}
        </View>;
    }
}

const styles = StyleSheet.create({
    fieldOverlay: {top: 0, left:0, right: 0, bottom: 0, backgroundColor: BG_MAIN_COLOR, position: 'absolute'}
});
