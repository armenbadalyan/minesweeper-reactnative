import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Orientation from 'react-native-orientation-locker';
import { initGame, cellClick, cellAltClick, convertToMines, setZoomLevel, GameStatus, GameOrientation } from '../../modules/game';
import { updateProfile } from '../../modules/auth';
import { aknowledgeUserModal } from '../../modules/preferences';
import StatBoard from '../../components/StatBoard';
import Minefield from '../../components/Minefield';
import UserIDModal from '../../components/UserIDModal';
import Slider from '../../components/Slider';
import { connectivityAvailable } from '../../shared/connection';
import { BG_MAIN_COLOR, BORDER1_COLOR, BORDER2_COLOR } from '../../constants';

const mapStateToProps = state => ({
    user: state.auth.user,
    preferences: state.preferences,
    game: state.game,    
    status: state.game.game.status,
    orientation: state.game.displaySettings.orientation,
    zoomLevel: state.game.displaySettings.zoomLevel,
    lastScore: state.score.lastScore,
    bestScore: state.score.bestScore
});

const mapDispatchToProps = dispatch => ({
    initGame: (difficulty) => {
        dispatch(initGame(difficulty));
    },
    cellClick: (id) => {
        dispatch(cellClick(id))
    },
    cellAltClick: (id) => {
        dispatch(cellAltClick(id))
    },
    convertToMines: () => {
        dispatch(convertToMines());
    },
    updateProfile: (displayName) => {
        dispatch(updateProfile(displayName));
    },
    aknowledgeUserModal: () => {
        dispatch(aknowledgeUserModal());
    },
    setZoomLevel: zoomLevel => {
        dispatch(setZoomLevel(zoomLevel));
    }
});

export class GameScreen extends Component {

    constructor(props) {
        super(props);

        this.handleCellClick = this.handleCellClick.bind(this);
        this.handleCellAltClick = this.handleCellAltClick.bind(this);
        this.onGameButtonPressed = this.onGameButtonPressed.bind(this);
        this.onMenuButtonPressed = this.onMenuButtonPressed.bind(this);
    }

    componentDidMount() {
        this.startGameWithOptions(this.props.navigation.getParam('gameOptions'));
    }

    componentWillUnmount() {
        Orientation.lockToPortrait();
        // reset zoom level when leaving the game
        this.props.setZoomLevel(1);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.status !== GameStatus.WON
            && await connectivityAvailable()
            && this.isHighScore()
            && this.userAvailable()
            && !this.userModalAknowledged()) {
            this.modal.show();
        }
    }

    countFlaggedMines(field) {
        return Object.keys(field.cells)
            .reduce((count, key) => {
                const cell = field.cells[key];
                return cell.flagged ? ++count : count;
            }, 0);
    }

    onGameButtonPressed() {
        this.startGameWithOptions(this.props.navigation.getParam('gameOptions'));
    }

    onMenuButtonPressed() {
        this.props.navigation.goBack();
    }

    handleCellClick(id) {
        this.props.cellClick(id);
    }

    handleCellAltClick(id) {
        this.props.cellAltClick(id);
    }

    handleConvertToMines = () => {
        this.props.convertToMines();
    }

    startGameWithOptions(options) {
        this.props.initGame(options.difficulty);
    }

    gameScoreReady() {
        const { status, lastScore } = this.props;

        return status === GameStatus.WON && lastScore;
    }

    onSubmitUser = async (displayName) => {
        this.modal.hide();
        this.props.updateProfile(displayName);
        this.props.aknowledgeUserModal();
    }

    isHighScore() {
        const { status, lastScore } = this.props;

        return status === GameStatus.WON && lastScore && lastScore.isBestScore;
    }

    userAvailable() {
        return this.props.user;
    }

    userModalAknowledged() {
        return this.props.preferences.userModalAknowledged;
    }

    render() {
        const isLandscape = this.props.orientation === GameOrientation.LANDSCAPE;
        return (
            <View style={[styles.game, ...(isLandscape ? [styles.gameLandscape] : [])]}>
                <StatBoard
                    style={styles.statboard}
                    isVertical={isLandscape}
                    game={this.props.game.game}
                    flaggedMines={this.countFlaggedMines(this.props.game.field)}
                    onGameButtonPressed={this.onGameButtonPressed}
                    onMenuButtonPressed={this.onMenuButtonPressed} />

                <Minefield 
                    style={isLandscape ? styles.minefieldVertical : styles.minefieldHorizontal} 
                    zoomLevel={this.props.zoomLevel} 
                    maxZoomLevel={2} 
                    field={this.props.game.field} 
                    status={this.props.game.game.status} 
                    onCellClick={this.handleCellClick} 
                    onCellAltClick={this.handleCellAltClick} />

                <Slider
                    style={isLandscape ? sliderStyles.sliderVertical : sliderStyles.sliderHorizontal}
                    orientation={isLandscape  ? 'vertical' : 'horizontal'}
                    minimumValue={1}
                    maximumValue={2}
                    value={this.props.zoomLevel}
                    trackStyle={[sliderStyles.track, isLandscape ? sliderStyles.trackVertical : sliderStyles.trackHorizontal]}
                    thumbStyle={[sliderStyles.thumb, isLandscape ? sliderStyles.thumbVertical : sliderStyles.thumbHorizontal]}
                    minimumTrackTintColor={BORDER2_COLOR}
                    maximumTrackTintColor={BORDER2_COLOR}
                    onValueChange={(newValue) => { this.props.setZoomLevel(newValue) }} />

                <UserIDModal ref={ref => this.modal = ref}
                    defaultValue={this.props.user && this.props.user.displayName}
                    onSubmit={this.onSubmitUser} />

            </View>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GameScreen);

GameScreen.propTypes = {
    game: PropTypes.shape({
        game: PropTypes.object,
        field: PropTypes.object,
        displaySettings: PropTypes.object
    }),
    lastScore: PropTypes.shape({
        score: PropTypes.number
    }),
    status: PropTypes.string,
    orientation: PropTypes.oneOf(GameOrientation.PORTRAIT, GameOrientation.LANDSCAPE),
    zoomLevel: PropTypes.number,
    user: PropTypes.shape({
        displayName: PropTypes.string
    }),
    preferences: PropTypes.shape({
        userModalAknowledged: PropTypes.bool
    }),
    navigation: PropTypes.shape({
        getParam: PropTypes.func,
        goBack: PropTypes.func
    }),
    cellClick: PropTypes.func,
    cellAltClick: PropTypes.func,
    convertToMines: PropTypes.func,
    initGame: PropTypes.func,
    updateProfile: PropTypes.func,
    aknowledgeUserModal: PropTypes.func,
    setZoomLevel: PropTypes.func
}

const styles = StyleSheet.create({
    game: {
        borderWidth: 12,
        borderColor: BG_MAIN_COLOR,
        borderStyle: 'solid',
        backgroundColor: BG_MAIN_COLOR
    },
    gameLandscape: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    statboard: {
        alignSelf: 'stretch'
    },
    minefieldHorizontal: {
        alignSelf: 'stretch'
    },
    minefieldVertical: {
        flex: 1
    }
});

const sliderStyles = StyleSheet.create({
    sliderHorizontal: {
        height: 40,
        width: '100%'
    },
    sliderVertical: {
        width: 40,
        height: '100%'
    },
    track: {
        borderRadius: 1
    },
    trackHorizontal: {
        height: 6
    },
    trackVertical: {
        width: 6
    },
    thumb: {
        backgroundColor: BG_MAIN_COLOR,
        borderWidth: 3,
        borderStyle: 'solid',
        borderRadius: 0,
        borderLeftColor: BORDER1_COLOR,
        borderTopColor: BORDER1_COLOR,
        borderRightColor: BORDER2_COLOR,
        borderBottomColor: BORDER2_COLOR,
    },
    thumbHorizontal: {
        width: 20,
        height: 30,
    },
    thumbVertical: {
        width: 30,
        height: 20,
    }
});