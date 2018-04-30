import { StyleSheet } from 'react-native';

const Styles = StyleSheet.create({
  lcd: {
    backgroundColor: '#000',
    /* box-sizing: border-box; */
    /* width: 120px; */
    height: 40,
    width: 68,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'solid',
    borderLeftColor: '#808080',
    borderTopColor: '#808080',
    borderRightColor: '#fff',
    borderBottomColor: '#fff',    
    padding: 2,
  },
  digit: {    
    width: 20,
    height: '100%',
    resizeMode: 'contain'
  },
});

export default Styles;