import { StyleSheet } from 'react-native';

const Styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    backgroundColor: '#C0C0C0',
    borderWidth: 3,
    borderStyle: 'solid',
    borderLeftColor: '#fff',
    borderTopColor: '#fff',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    padding: 3
  },
  openCell: {    
    borderWidth: 0,    
    borderBottomWidth: 1,    
    borderBottomColor: '#818181',
    borderLeftWidth: 1,    
    borderLeftColor: '#818181'    
  },
  explodedCell: {
    backgroundColor: '#FC371E'
  },
  cellIcon: {
    resizeMode: 'contain'
  }
});

export default Styles;