import { StyleSheet } from 'react-native';
import { BG_MAIN_COLOR, BG_ALT_COLOR, BORDER1_COLOR, BORDER2_COLOR } from '../../constants';

const Styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    padding: 3
  },
  openCell: {    
    borderWidth: 0,    
    borderBottomWidth: 1,    
    borderBottomColor: BG_ALT_COLOR,
    borderLeftWidth: 1,    
    borderLeftColor: BG_ALT_COLOR ,
    backgroundColor: '#DDD'
  },
  explodedCell: {
    backgroundColor: '#FC371E'
  },
  cellIcon: {
    resizeMode: 'contain'
  }
});

export default Styles;