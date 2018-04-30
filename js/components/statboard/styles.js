import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  statboard: {
    width: '100%',    
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10    
  },
  startButton: {
    backgroundColor: '#C0C0C0',
    width: 40,
    height: 40,
    borderWidth: 3,
    borderStyle: 'solid',    
    borderLeftColor: '#fff',
    borderTopColor: '#fff',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    padding: 4   
  },
  startButtonIcon: {    
    flex: 1,
    resizeMode: 'contain',
    width: undefined,
    height: undefined
  }

});

export default styles;