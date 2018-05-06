import { StyleSheet } from 'react-native';
import { BG_MAIN_COLOR, BG_ALT_COLOR, BORDER1_COLOR, BORDER2_COLOR } from '../../constants';

const Styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    borderWidth: 3,
    borderStyle: 'solid',
    borderLeftColor: BORDER1_COLOR,
    borderTopColor: BORDER1_COLOR,
    borderRightColor: BORDER2_COLOR,
    borderBottomColor: BORDER2_COLOR,
    padding: 3
  },
  openCell: {    
    borderWidth: 0,    
    borderBottomWidth: 1,    
    borderBottomColor: BG_ALT_COLOR,
    borderLeftWidth: 1,    
    borderLeftColor: BG_ALT_COLOR    
  },
  explodedCell: {
    backgroundColor: '#FC371E'
  },
  cellIcon: {
    resizeMode: 'contain'
  }
});

export default Styles;