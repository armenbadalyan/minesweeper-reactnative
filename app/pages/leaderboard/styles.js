import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  leaderboard: {   
    flex: 1, 
    backgroundColor: '#C0C0C0'    
  },
  user: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  avatar: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  }

});

export default styles;