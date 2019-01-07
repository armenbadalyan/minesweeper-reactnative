import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { WebGLView } from "react-native-webgl";
import { GameStatus } from '../modules/game';
import TextureManager from '../shared/texture-manager';
import {
    View,
    AppState,
    TouchableWithoutFeedback,
    StyleSheet,
    ViewPropTypes as RNViewPropTypes
} from 'react-native';
import PanView from './PanView';
import commonStyles from '../shared/styles.js';

const ViewPropTypes = RNViewPropTypes || View.propTypes;
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
        offsetX: 0.25,
        offsetY: 0.75
    },
    closed: {
        offsetX: 0.5,
        offsetY: 0.75
    }

};
const assetsPerRow = 4;

export default class Minefield extends PureComponent {
    cellSize = 0
    cellScaledSize = 0;
    fieldWidth = 0;
    fieldHeight = 0;
    unscaledFieldWidth = 0;
    unscaledFieldHeight = 0;
    cellDimensions = null;

    gl = null;
    texturesLoaded = false;
    program;
    uSampler;

    constructor(props) {
        super(props);

        this.state = {
            appState: 'active',
            gameFieldReady: false,
            viewWidth: 0,
            viewHeight: 0
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this.onAppStateChanged);
    }

    componentWillUnmount() {
        this.unloadTextures();
        AppState.removeEventListener('change', this.onAppStateChanged);
    }

    handleLayoutChange = (event) => {
        this.setState({
            viewWidth: event.nativeEvent.layout.width,
            viewHeight: event.nativeEvent.layout.height
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
            cellX = Math.floor(x / this.cellScaledSize);
            cellY = Math.floor(y / this.cellScaledSize);

            return field.cells[cellY + ':' + cellX] || null;
        }
        else {
            return null;
        }
    }

    onContextCreate = (gl) => {
        this.gl = gl;

        TextureManager.loadTextures(gl, textures).then(() => {
            this.texturesLoaded = true;
            this.createShaders();
            this.renderField(this.props.field, this.props.status);
            setTimeout(() => {
                this.setState({ gameFieldReady: true });
            }, 20);

        }).catch(err => {
            console.log(err);
        });
    }

    onAppStateChanged = (nextAppState) => {
        // when pausing unload textures to prevent black square/flickering problems after resume
        if (nextAppState !== 'active') {
            this.unloadTextures();
        }

        this.setState({ appState: nextAppState });
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
        this.program.aVertexPosition = gl.getAttribLocation(this.program, "aVertexPosition");
        this.program.textureCoord = gl.getAttribLocation(this.program, "aTexCoord");
        this.uSampler = gl.getUniformLocation(this.program, "t");
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
            gl.enableVertexAttribArray(program.aVertexPosition);
            gl.vertexAttribPointer(program.aVertexPosition, itemSize, gl.FLOAT, false, 0, 0);

            // color attribute
            /*gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            program.color = gl.getAttribLocation(program, "color");
            gl.vertexAttribPointer(program.color, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.color);*/

            // texture coordinate attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);           
            gl.vertexAttribPointer(program.textureCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(program.textureCoord);

            // map the texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, TextureManager.getTexture('field_assets'));
            gl.uniform1i(this.uSampler, 0);

            gl.drawArrays(gl.TRIANGLES, 0, numItems);          
            
            const rngl = this.gl.getExtension("RN");
            rngl.endFrame();            
        }
    }

    renderCell(cell, vertices, colors, textureCoords) {

        const x = this.toGLX(cell.col * this.cellScaledSize);
        const y = this.toGLY(cell.row * this.cellScaledSize);
        const cw = this.scaleToGLWidth(this.cellScaledSize);
        const ch = this.scaleToGLHeight(this.cellScaledSize);

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
                asset = assets['closed'];
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
        return 2 * x / (this.unscaledFieldWidth * this.props.maxZoomLevel) - 1;
    }

    toGLY(y) {
        return 1 - 2 * y / (this.unscaledFieldHeight * this.props.maxZoomLevel);
    }

    scaleToGLWidth(width) {
        return (2 * width) / (this.unscaledFieldWidth * this.props.maxZoomLevel );
    }

    scaleToGLHeight(height) {
        return (2 * height) / (this.unscaledFieldHeight * this.props.maxZoomLevel);
    }

    render() {
        if (this.state.viewWidth && this.state.viewHeight) {
            const rows = this.props.field.rows,
                cols = this.props.field.cols;

            this.cellSize = (this.state.viewWidth - FIELD_BORDER_WIDTH * 2) / cols;
            this.cellScaledSize = this.cellSize * this.props.zoomLevel;
            this.fieldWidth = this.cellScaledSize * cols;
            this.fieldHeight = this.cellScaledSize * rows;
            this.unscaledFieldWidth = this.cellSize * cols;
            this.unscaledFieldHeight = this.cellSize * rows;

            const fieldStyles = StyleSheet.create({
                scrollDimensions: {
                    width: this.unscaledFieldWidth,
                    height: this.unscaledFieldHeight
                },
                fieldContainer: {
                    width: this.fieldWidth,
                    height: this.fieldHeight
                },
                fieldDimensions: {
                    width: this.unscaledFieldWidth * this.props.maxZoomLevel,
                    height: this.unscaledFieldHeight * this.props.maxZoomLevel
                }
            });

            if (this.state.gameFieldReady) {
                this.renderField(this.props.field, this.props.status);
            }

            return <View style={[commonStyles.border, this.props.style, {opacity: this.state.gameFieldReady ? 1 : 0}]} onLayout={this.handleLayoutChange} >                
                    <PanView style={fieldStyles.scrollDimensions}>
                        <TouchableWithoutFeedback delayLongPress={300} onPress={this.onFieldPress} onLongPress={this.onFieldLongPress}>
                            <View style={fieldStyles.fieldContainer}>
                                {this.state.appState === 'active' ? <WebGLView style={fieldStyles.fieldDimensions} onContextCreate={this.onContextCreate} /> : null}
                            </View>
                        </TouchableWithoutFeedback>
                    </PanView>            
            </View>;
        }
        else {
            return <View style={[commonStyles.border, this.props.style]} onLayout={this.handleLayoutChange} />;
        }
    }
}

Minefield.propTypes = {
    field: PropTypes.shape({
        rows: PropTypes.number,
        cols: PropTypes.number,
        cells: PropTypes.object
    }),
    zoomLevel: PropTypes.number,
    maxZoomLevel: PropTypes.number,
    status: PropTypes.string,
    style: ViewPropTypes.style,
    onCellClick: PropTypes.func,
    onCellAltClick: PropTypes.func
}
